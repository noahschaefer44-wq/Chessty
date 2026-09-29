// Kostenloser Server (Supabase): Konto ohne E-Mail, Sync, Freunde, Liga, Tagespuzzle, Online-Partien.
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { getProgress, update, isoWeek, type Progress } from './progress';

const URL = 'https://ltrigzesyzpzpluzjtum.supabase.co';
// Öffentlicher Schlüssel – darf im Browser stehen; alle Daten sind über Sync-Codes geschützt.
const KEY = 'sb_publishable_ilt_PLYjC1hEQc0VUOwLOA_PwdLhQmr';
const ACC = 'chessty.account';

export interface Account {
  id: string;
  secret: string;
  name: string;
  friendCode: string;
  league?: number;
  lastSync?: number;
}

export const LEAGUES = ['Bronze', 'Silber', 'Gold', 'Platin', 'Diamant'];

let client: Promise<SupabaseClient> | null = null;
/** Supabase erst bei Bedarf laden (hält das Hauptpaket klein). */
export function sb(): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(URL, KEY, { auth: { persistSession: false } }));
  return client;
}

export function getAccount(): Account | null {
  try {
    return JSON.parse(localStorage.getItem(ACC) ?? 'null');
  } catch {
    return null;
  }
}
function setAccount(a: Account | null) {
  try {
    if (a) localStorage.setItem(ACC, JSON.stringify(a));
    else localStorage.removeItem(ACC);
  } catch {
    /* egal */
  }
  window.dispatchEvent(new CustomEvent('chessty-account'));
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const c = await sb();
  const { data, error } = await c.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

/** Sync-Code für andere Geräte: id.secret */
export const syncCode = (a: Account) => `${a.id}.${a.secret}`;

export async function register(name: string): Promise<Account> {
  const [r] = await rpc<{ id: string; secret: string; friend_code: string }[]>('chessty_register', { p_name: name });
  const a: Account = { id: r.id, secret: r.secret, name, friendCode: r.friend_code };
  setAccount(a);
  await push();
  return a;
}

/** Mit Sync-Code eines anderen Geräts verbinden und dessen Fortschritt übernehmen. */
export async function connect(code: string, keepLocal: boolean): Promise<Account> {
  const [id, secret] = code.trim().split('.');
  const [r] = await rpc<{ name: string; friend_code: string; progress: Progress | null; league: number }[]>('chessty_pull', { p_id: id, p_secret: secret });
  const a: Account = { id, secret, name: r.name, friendCode: r.friend_code, league: r.league };
  setAccount(a);
  if (!keepLocal && r.progress) update(() => ({ ...getProgress(), ...r.progress }));
  await push();
  return a;
}

export function logout() {
  setAccount(null);
}

export async function deleteAccount() {
  const a = getAccount();
  if (!a) return;
  await rpc('chessty_delete', { p_id: a.id, p_secret: a.secret });
  setAccount(null);
}

export async function rename(name: string) {
  const a = getAccount();
  if (!a) return;
  await rpc('chessty_rename', { p_id: a.id, p_secret: a.secret, p_name: name });
  setAccount({ ...a, name });
}

let pushing = false;
export async function push(): Promise<void> {
  const a = getAccount();
  if (!a || pushing || !navigator.onLine) return;
  pushing = true;
  try {
    const p = getProgress();
    const [r] = await rpc<{ league: number; weekly_xp: number; friend_code: string; name: string }[]>('chessty_push', {
      p_id: a.id,
      p_secret: a.secret,
      p_progress: p,
      p_xp: p.xp,
      p_streak: p.streak,
      p_rating: p.puzzleRating,
      p_week_xp: p.weekXp?.week === isoWeek() ? p.weekXp.xp : 0,
    });
    setAccount({ ...a, league: r.league, name: r.name, friendCode: r.friend_code, lastSync: Date.now() });
  } catch {
    /* offline oder Server schläft – später erneut */
  } finally {
    pushing = false;
  }
}

/** Automatisch synchronisieren: kurz nach jeder Änderung, sobald wieder online. */
let timer: number | undefined;
export function startAutoSync(subscribe: (l: () => void) => () => void) {
  const schedule = () => {
    if (!getAccount()) return;
    clearTimeout(timer);
    timer = window.setTimeout(() => void push(), 4000);
  };
  subscribe(schedule);
  window.addEventListener('online', schedule);
  schedule();
}

export interface FriendRow {
  name: string;
  friend_code: string;
  xp: number;
  weekly_xp: number;
  streak: number;
  puzzle_rating: number;
  is_me: boolean;
}
export const friends = () => {
  const a = getAccount()!;
  return rpc<FriendRow[]>('chessty_friends', { p_id: a.id, p_secret: a.secret });
};
export const addFriend = (code: string) => {
  const a = getAccount()!;
  return rpc<string>('chessty_add_friend', { p_id: a.id, p_secret: a.secret, p_code: code });
};
export const removeFriend = (code: string) => {
  const a = getAccount()!;
  return rpc('chessty_remove_friend', { p_id: a.id, p_secret: a.secret, p_code: code });
};
export const league = () => {
  const a = getAccount()!;
  return rpc<{ name: string; weekly_xp: number; league: number; is_me: boolean }[]>('chessty_league', { p_id: a.id, p_secret: a.secret });
};
export const dailySubmit = (day: string, solved: boolean, ms: number) => {
  const a = getAccount();
  if (!a) return Promise.resolve();
  return rpc('chessty_daily_submit', { p_id: a.id, p_secret: a.secret, p_day: day, p_solved: solved, p_ms: ms });
};
export const dailyBoard = (day: string) => rpc<{ name: string; solved: boolean; ms: number }[]>('chessty_daily_board', { p_day: day });

// ───────── Online-Partien über Realtime-Broadcast (keine Datenbank nötig) ─────────
export type NetMsg =
  | { t: 'hello'; name: string; id: string }
  | { t: 'start'; white: string; black: string; clock: number }
  | { t: 'move'; uci: string; n: number }
  | { t: 'resign'; id: string }
  | { t: 'draw-offer'; id: string }
  | { t: 'draw-accept' }
  | { t: 'chat'; name: string; text: string };

export interface GameConn {
  send: (m: NetMsg) => void;
  leave: () => void;
  me: string;
  mode: 'echtzeit' | 'server';
}

/** Online-Partie beitreten: zuerst Echtzeit (WebSocket), sonst Server-Abfrage im Sekundentakt. */
export async function joinGame(code: string, onMsg: (m: NetMsg) => void, onPresence: (n: number) => void): Promise<GameConn> {
  const me = Math.random().toString(36).slice(2, 10);
  try {
    return await joinRealtime(code, me, onMsg, onPresence);
  } catch {
    return joinPolling(code, me, onMsg, onPresence);
  }
}

async function joinRealtime(code: string, me: string, onMsg: (m: NetMsg) => void, onPresence: (n: number) => void): Promise<GameConn> {
  const c = await sb();
  const ch: RealtimeChannel = c.channel('chessty-game-' + code, { config: { broadcast: { self: false }, presence: { key: me } } });
  ch.on('broadcast', { event: 'm' }, ({ payload }) => onMsg(payload as NetMsg));
  ch.on('presence', { event: 'sync' }, () => onPresence(Object.keys(ch.presenceState()).length));
  await new Promise<void>((res, rej) => {
    const t = setTimeout(() => rej(new Error('Zeitüberschreitung')), 6000);
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(t);
        void ch.track({ at: Date.now() });
        res();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        clearTimeout(t);
        rej(new Error('Verbindung fehlgeschlagen'));
      }
    });
  }).catch((e) => {
    void c.removeChannel(ch);
    throw e;
  });
  return { me, mode: 'echtzeit', send: (m) => void ch.send({ type: 'broadcast', event: 'm', payload: m }), leave: () => void c.removeChannel(ch) };
}

async function joinPolling(code: string, me: string, onMsg: (m: NetMsg) => void, onPresence: (n: number) => void): Promise<GameConn> {
  let after = 0;
  let alive = true;
  const seen = new Set<string>([me]);
  const send = (m: NetMsg) => void rpc('chessty_game_send', { p_code: code, p_sender: me, p_msg: m }).catch(() => undefined);
  // Anwesenheit: jeder meldet sich mit „join“
  send({ t: 'chat', name: '__join__', text: me });
  const loop = async () => {
    while (alive) {
      try {
        const rows = await rpc<{ seq: number; sender: string; msg: NetMsg }[]>('chessty_game_poll', { p_code: code, p_after: after });
        for (const r of rows) {
          after = Math.max(after, r.seq);
          if (r.sender === me) continue;
          if (r.msg.t === 'chat' && r.msg.name === '__join__') {
            if (!seen.has(r.sender)) {
              seen.add(r.sender);
              onPresence(seen.size);
              send({ t: 'chat', name: '__join__', text: me });
            }
            continue;
          }
          onMsg(r.msg);
        }
      } catch {
        /* Netzwerkfehler – weiter versuchen */
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  };
  void loop();
  onPresence(1);
  return { me, mode: 'server', send, leave: () => (alive = false) };
}

export const newGameCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
