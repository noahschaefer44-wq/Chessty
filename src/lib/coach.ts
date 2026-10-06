// Übergabe einer Bot-Partie an den Fehler-Coach (src/pages/Coach.tsx) über sessionStorage.
export interface CoachGame {
  fen: string;
  moves: string[];
  me: 'w' | 'b';
  bot: string;
}

export const COACH_KEY = 'chessty.coach';

export function openCoach(g: CoachGame) {
  try {
    sessionStorage.setItem(COACH_KEY, JSON.stringify(g));
  } catch {
    /* egal */
  }
  location.hash = '#/coach';
}
