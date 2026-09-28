// Kleiner, ausfallsicherer Wrapper um localStorage (privater Modus, blockierte Daten …).
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Speicher nicht verfügbar – App läuft trotzdem weiter */
  }
}
