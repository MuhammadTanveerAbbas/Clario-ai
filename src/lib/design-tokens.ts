export const DARK_TOKENS: Record<string, string> = {
  '--bg': '#0c0a09',
  '--bg2': '#111110',
  '--bg3': '#1c1917',
  '--border': '#292524',
  '--border2': '#3d3935',
  '--text': '#fafaf9',
  '--text2': '#d6d3d1',
  '--text3': '#78716c',
  '--accent': '#f97316',
  '--accent-l': '#1a0f07',
  '--accent-m': '#431407',
  '--sidebar': '#111110',
  '--sidebar-b': '#292524',
  '--card': '#1c1917',
  '--card-b': '#292524',
  '--input': '#111110',
  '--input-b': '#292524',
  '--success': '#4ade80',
  '--error': '#f87171',
}

export const LIGHT_TOKENS: Record<string, string> = {
  '--bg': '#ffffff',
  '--bg2': '#fafaf9',
  '--bg3': '#f5f5f4',
  '--border': '#e7e5e4',
  '--border2': '#d6d3d1',
  '--text': '#0c0a09',
  '--text2': '#44403c',
  '--text3': '#78716c',
  '--accent': '#f97316',
  '--accent-l': '#fff7ed',
  '--accent-m': '#fed7aa',
  '--sidebar': '#fafaf9',
  '--sidebar-b': '#e7e5e4',
  '--card': '#ffffff',
  '--card-b': '#e7e5e4',
  '--input': '#fafaf9',
  '--input-b': '#e7e5e4',
  '--success': '#15803d',
  '--error': '#be123c',
}

export function applyTokens(theme: 'dark' | 'light') {
  const tokens = theme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS
  const root = document.documentElement
  // Apply as inline styles on :root — these have highest specificity and override everything
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
