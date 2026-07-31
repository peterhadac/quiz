// src/config/colors.ts
export const colors = {
  primary: '#813405',
  secondary: '#d45113',
  highlight: '#f9a03f',
  light: '#f8dda4',
  lightest: '#ddf9c1',
  text: '#1e1e1e',
  border: '#d4c5a9',
  background: '#fdfbf5',
  surface: '#ffffff',
  surfaceElevated: '#f5f2e8',
  success: '#5a9e5a',
  warning: '#f9a03f',
  error: '#d45113',
  muted: '#6a6a6a',
} as const;

export type ColorKey = keyof typeof colors;
