import { Component, type ReactNode } from 'react';

/** Fängt Laufzeitfehler ab, damit nie nur ein leerer Hintergrund bleibt. */
export default class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="finish">
        <div className="stamp">HOPPLA</div>
        <h2>Da ist etwas schiefgelaufen.</h2>
        <p className="muted">Dein Fortschritt ist gespeichert. Lade die Seite neu oder geh zurück.</p>
        <p className="mono muted" style={{ fontSize: 12 }}>{this.state.error.message}</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn primary" onClick={() => this.setState({ error: null })}>Nochmal versuchen</button>
          <button className="btn" onClick={() => location.reload()}>Neu laden</button>
          <a className="btn" href="#/">Startseite</a>
        </div>
      </div>
    );
  }
}
