// Stockfish 19 (WASM, lite, single-threaded) als Web Worker – läuft komplett offline im Browser.

export interface EngineLine {
  depth: number;
  /** Bewertung aus Sicht von Weiß in Bauerneinheiten */
  cp?: number;
  /** Matt in n (positiv = Weiß setzt matt) */
  mate?: number;
  pv: string[];
  multipv: number;
}

export interface SearchOptions {
  depth?: number;
  movetime?: number;
  multipv?: number;
  skill?: number;
  onInfo?: (lines: EngineLine[]) => void;
}

type Job = {
  fen: string;
  opts: SearchOptions;
  resolve: (r: { best: string; lines: EngineLine[] }) => void;
};

class Engine {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private queue: Job[] = [];
  private busy = false;
  private listener: ((line: string) => void) | null = null;

  private init(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      try {
        const url = new URL('engine/stockfish.js', document.baseURI).href;
        this.worker = new Worker(url);
      } catch (e) {
        reject(e);
        return;
      }
      this.worker.onmessage = (e) => {
        const line = String(e.data);
        if (line === 'uciok') this.send('isready');
        else if (line === 'readyok') resolve();
        this.listener?.(line);
      };
      this.worker.onerror = (e) => {
        reject(e);
        // Abgestürzte Engine: Worker verwerfen, beim nächsten Auftrag neu starten und Nutzer informieren
        this.worker?.terminate();
        this.worker = null;
        this.ready = null;
        this.busy = false;
        this.queue = [];
        window.dispatchEvent(new CustomEvent('chessty-error', { detail: 'Die Schach-Engine ist abgestürzt und wird neu gestartet.' }));
      };
      this.send('uci');
    });
    return this.ready;
  }

  private send(cmd: string) {
    this.worker?.postMessage(cmd);
  }

  analyse(fen: string, opts: SearchOptions = {}): Promise<{ best: string; lines: EngineLine[] }> {
    return new Promise((resolve) => {
      // Ältere, noch wartende Aufträge verwerfen – nur die aktuelle Stellung zählt
      this.queue = [];
      this.queue.push({ fen, opts, resolve });
      if (this.busy) this.send('stop');
      else void this.next();
    });
  }

  stop() {
    this.queue = [];
    if (this.busy) this.send('stop');
  }

  private async next() {
    const job = this.queue.shift();
    if (!job) return;
    this.busy = true;
    await this.init();
    const { fen, opts } = job;
    const white = fen.split(' ')[1] === 'w';
    const lines: EngineLine[] = [];
    await new Promise<void>((done) => {
      this.listener = (line) => {
        if (line.startsWith('info') && line.includes(' pv ')) {
          const depth = +(/ depth (\d+)/.exec(line)?.[1] ?? 0);
          const multipv = +(/ multipv (\d+)/.exec(line)?.[1] ?? 1);
          const cp = /score cp (-?\d+)/.exec(line);
          const mate = /score mate (-?\d+)/.exec(line);
          const pv = line.split(' pv ')[1].trim().split(' ');
          const sign = white ? 1 : -1;
          lines[multipv - 1] = {
            depth,
            multipv,
            pv,
            cp: cp ? (sign * +cp[1]) / 100 : undefined,
            mate: mate ? sign * +mate[1] : undefined,
          };
          opts.onInfo?.(lines.filter(Boolean));
        } else if (line.startsWith('bestmove')) {
          this.listener = null;
          job.resolve({ best: line.split(' ')[1], lines: lines.filter(Boolean) });
          done();
        }
      };
      this.send(`setoption name Skill Level value ${opts.skill ?? 20}`);
      this.send(`setoption name MultiPV value ${opts.multipv ?? 1}`);
      this.send(`position fen ${fen}`);
      if (opts.movetime) this.send(`go movetime ${opts.movetime}`);
      else this.send(`go depth ${opts.depth ?? 14}`);
    });
    this.busy = false;
    void this.next();
  }
}

export const engine = new Engine();

export function formatEval(l?: Pick<EngineLine, 'cp' | 'mate'>): string {
  if (!l) return '…';
  if (l.mate !== undefined) return l.mate === 0 ? '#' : `#${l.mate > 0 ? '' : '-'}${Math.abs(l.mate)}`;
  if (l.cp === undefined) return '…';
  if (Math.abs(l.cp) >= 100) return '#';
  return (l.cp > 0 ? '+' : '') + l.cp.toFixed(1);
}

/** Bewertung als Zahl (Matt → ±100) aus Sicht von Weiß. */
export function evalNumber(l?: Pick<EngineLine, 'cp' | 'mate'>): number {
  if (!l) return 0;
  if (l.mate !== undefined) return l.mate >= 0 ? 100 : -100;
  return l.cp ?? 0;
}

/** Gewinnwahrscheinlichkeit (0–1) aus Sicht von Weiß – wie auf Lichess. */
export function winChance(l?: Pick<EngineLine, 'cp' | 'mate'>): number {
  const cp = Math.max(-10, Math.min(10, evalNumber(l)));
  return 1 / (1 + Math.exp(-0.368 * cp));
}
