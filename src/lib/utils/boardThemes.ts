export type BoardTheme = {
  name: string;
  light: string;
  dark: string;
  border?: string;
};

export const THEMES: Record<string, BoardTheme> = {
  classic: { name: 'classic', light: '#f0d9b5', dark: '#b58863', border: '#8b5a2b' },
  green: { name: 'green', light: '#e6f6e6', dark: '#6aa86a', border: '#397039' },
  blue: { name: 'blue', light: '#e6f0fb', dark: '#4a7bd4', border: '#2b4f8a' },
  gray: { name: 'gray', light: '#f5f5f5', dark: '#bdbdbd', border: '#8a8a8a' }
};

export function getBoardTheme(name: string): BoardTheme {
  return THEMES[name] ?? THEMES.classic;
}

export function listBoardThemes(): BoardTheme[] {
  return Object.values(THEMES);
}
