// Angaben zum Betreiber für Impressum und Datenschutzerklärung (§ 5 DDG, Art. 13 DSGVO).
// WICHTIG: Diese Felder müssen mit echten Daten gefüllt werden – bitte nichts erfinden.
// Solange sie leer sind, zeigt das Impressum einen deutlichen Hinweis.
export const OPERATOR = {
  name: '',
  street: '',
  city: '', // PLZ und Ort
  country: 'Deutschland',
  email: '',
};

export const operatorComplete = () => !!(OPERATOR.name && OPERATOR.street && OPERATOR.city && OPERATOR.email);

export const LEGAL_UPDATED = '29.09.2026';
export const SOURCE_URL = 'https://github.com/noahschaefer44-wq/chessty';
