export const LIGHT_TOKENS: Record<string, string> = {
  "--bg": "#ffffff",
  "--bg2": "#fafaf9",
  "--bg3": "#f5f5f4",
  "--border": "30 11% 91%",
  "--border2": "#d6d3d1",
  "--text": "#0c0a09",
  "--text2": "#44403c",
  "--text3": "#78716c",
  "--accent": "25 95% 53%",
  "--accent-l": "#fff7ed",
  "--accent-m": "#fed7aa",
  "--sidebar": "#fafaf9",
  "--sidebar-b": "#e7e5e4",
  "--card": "0 0% 100%",
  "--card-b": "#e7e5e4",
  "--input": "#fafaf9",
  "--input-b": "#e7e5e4",
  "--success": "#15803d",
  "--error": "#be123c",
};

export function applyTokens(_theme?: string) {
  const root = document.documentElement;
  Object.entries(LIGHT_TOKENS).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
