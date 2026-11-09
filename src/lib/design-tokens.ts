export const LIGHT_TOKENS: Record<string, string> = {
  "--bg": "#faf9f6",
  "--bg2": "#f4f1ec",
  "--bg3": "#ece8e1",
  "--border": "34 17% 87%",
  "--border2": "#cfc7bb",
  "--text": "#171412",
  "--text2": "#4a443e",
  "--text3": "#6f675e",
  "--accent": "25 95% 53%",
  "--accent-l": "#fff7ed",
  "--accent-m": "#fdba74",
  "--sidebar": "#f3f0ea",
  "--sidebar-b": "#e2dcd2",
  "--card": "0 0% 100%",
  "--card-b": "#e6e0d6",
  "--input": "#faf9f6",
  "--input-b": "#ded7cc",
  "--success": "#15803d",
  "--error": "#b42318",
  "--surface": "#ffffff",
  "--surface-2": "#f7f4ef",
  "--surface-3": "#efeae2",
  "--ink": "#171412",
  "--ink-2": "#4a443e",
  "--ink-3": "#6f675e",
  "--line": "#e6e0d6",
  "--line-strong": "#cfc7bb",
  "--brand": "#f97316",
  "--brand-hover": "#ea580c",
  "--brand-soft": "#fff7ed",
  "--brand-line": "#fdba74",
};

export function applyTokens(_theme?: string) {
  const root = document.documentElement;
  Object.entries(LIGHT_TOKENS).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
