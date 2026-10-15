/**
 * Harvinder Telecom Design Tokens
 * Conforming to Universal Frontend Design Constitution
 * Navy & Electric Blue Palette, High-Contrast Typography & Spacing Math
 */

export const DESIGN_TOKENS = {
  colors: {
    primaryNavy: '#0B192C',
    navyMedium: '#102A43',
    navyLight: '#1E3E62',
    electricBlue: '#0066FF',
    electricBlueHover: '#0052CC',
    blueMuted: '#EFF6FF',
    canvasBg: '#F8FAFC',
    cardBg: '#FFFFFF',
    borderSubtle: '#E2E8F0',
    borderMedium: '#CBD5E1',
    textHeadline: '#0F172A',
    textBody: '#334155',
    textMuted: '#64748B',
    success: '#059669',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
  },
  typography: {
    fontSans: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
  },
  spacing: {
    touchTargetMin: '44px',
    containerPadding: '1rem',
    containerPaddingLg: '1.5rem',
  },
  transitions: {
    micro: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    standard: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
  }
} as const;
