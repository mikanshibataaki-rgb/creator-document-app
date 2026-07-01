import type { CSSProperties } from 'react'

export type PromoThemeName = 'standard' | 'contract' | 'journal' | 'studio'

export type PromoTheme = {
  name: PromoThemeName
  background: string
  ambient: string
  sheen: string
  surface: string
  surfaceSoft: string
  surfaceElevated: string
  surfaceInk: string
  surfaceMuted: string
  surfaceFaint: string
  surfaceBorder: string
  text: string
  muted: string
  faint: string
  accent: string
  accentSoft: string
  accentLine: string
  accentHalo: string
  shadow: string
  softShadow: string
  line: string
  lineStrong: string
  panel: string
  panelSoft: string
  panelMuted: string
}

export const promoThemes: Record<PromoThemeName, PromoTheme> = {
  standard: {
    name: 'standard',
    background: '#070707',
    ambient: 'rgba(255, 250, 242, 0.11)',
    sheen: 'rgba(255, 255, 255, 0.035)',
    surface: '#f7f3ee',
    surfaceSoft: '#ebe5dc',
    surfaceElevated: '#fffaf3',
    surfaceInk: '#17130f',
    surfaceMuted: '#776d63',
    surfaceFaint: '#9d9387',
    surfaceBorder: 'rgba(20, 17, 14, 0.08)',
    text: '#fffaf2',
    muted: '#a59d93',
    faint: '#5d5750',
    accent: '#FF7A66',
    accentSoft: 'rgba(255, 122, 102, 0.12)',
    accentLine: 'rgba(255, 122, 102, 0.28)',
    accentHalo: 'rgba(255, 122, 102, 0.12)',
    shadow: '0 28px 80px rgba(0, 0, 0, 0.28)',
    softShadow: '0 14px 34px rgba(42, 34, 26, 0.08)',
    line: 'rgba(255, 250, 242, 0.14)',
    lineStrong: 'rgba(255, 250, 242, 0.22)',
    panel: 'rgba(255, 250, 242, 0.08)',
    panelSoft: 'rgba(255, 250, 242, 0.055)',
    panelMuted: 'rgba(255, 250, 242, 0.045)',
  },
  contract: {
    name: 'contract',
    background: '#080807',
    ambient: 'rgba(255, 250, 242, 0.11)',
    sheen: 'rgba(255, 255, 255, 0.035)',
    surface: '#f8f5ef',
    surfaceSoft: '#ece7dd',
    surfaceElevated: '#fffaf3',
    surfaceInk: '#17130f',
    surfaceMuted: '#776d63',
    surfaceFaint: '#9d9387',
    surfaceBorder: 'rgba(20, 17, 14, 0.08)',
    text: '#fffaf1',
    muted: '#aaa198',
    faint: '#615a52',
    accent: '#FF7A66',
    accentSoft: 'rgba(255, 122, 102, 0.12)',
    accentLine: 'rgba(255, 122, 102, 0.28)',
    accentHalo: 'rgba(255, 122, 102, 0.12)',
    shadow: '0 28px 80px rgba(0, 0, 0, 0.3)',
    softShadow: '0 14px 34px rgba(42, 34, 26, 0.08)',
    line: 'rgba(255, 250, 242, 0.14)',
    lineStrong: 'rgba(255, 250, 242, 0.22)',
    panel: 'rgba(255, 250, 242, 0.08)',
    panelSoft: 'rgba(255, 250, 242, 0.055)',
    panelMuted: 'rgba(255, 250, 242, 0.045)',
  },
  journal: {
    name: 'journal',
    background: '#070808',
    ambient: 'rgba(255, 250, 242, 0.11)',
    sheen: 'rgba(255, 255, 255, 0.035)',
    surface: '#f6f3ed',
    surfaceSoft: '#e9e5dc',
    surfaceElevated: '#fffaf3',
    surfaceInk: '#17130f',
    surfaceMuted: '#776d63',
    surfaceFaint: '#9d9387',
    surfaceBorder: 'rgba(20, 17, 14, 0.08)',
    text: '#fffaf2',
    muted: '#a8a097',
    faint: '#5d5750',
    accent: '#FF7A66',
    accentSoft: 'rgba(255, 122, 102, 0.12)',
    accentLine: 'rgba(255, 122, 102, 0.28)',
    accentHalo: 'rgba(255, 122, 102, 0.12)',
    shadow: '0 28px 80px rgba(0, 0, 0, 0.28)',
    softShadow: '0 14px 34px rgba(42, 34, 26, 0.08)',
    line: 'rgba(255, 250, 242, 0.14)',
    lineStrong: 'rgba(255, 250, 242, 0.22)',
    panel: 'rgba(255, 250, 242, 0.08)',
    panelSoft: 'rgba(255, 250, 242, 0.055)',
    panelMuted: 'rgba(255, 250, 242, 0.045)',
  },
  studio: {
    name: 'studio',
    background: '#060606',
    ambient: 'rgba(255, 250, 242, 0.11)',
    sheen: 'rgba(255, 255, 255, 0.035)',
    surface: '#f7f4ee',
    surfaceSoft: '#ebe5dc',
    surfaceElevated: '#fffaf3',
    surfaceInk: '#17130f',
    surfaceMuted: '#776d63',
    surfaceFaint: '#9d9387',
    surfaceBorder: 'rgba(20, 17, 14, 0.08)',
    text: '#fffaf2',
    muted: '#a59d93',
    faint: '#5d5750',
    accent: '#FF7A66',
    accentSoft: 'rgba(255, 122, 102, 0.12)',
    accentLine: 'rgba(255, 122, 102, 0.28)',
    accentHalo: 'rgba(255, 122, 102, 0.12)',
    shadow: '0 28px 80px rgba(0, 0, 0, 0.28)',
    softShadow: '0 14px 34px rgba(42, 34, 26, 0.08)',
    line: 'rgba(255, 250, 242, 0.14)',
    lineStrong: 'rgba(255, 250, 242, 0.22)',
    panel: 'rgba(255, 250, 242, 0.08)',
    panelSoft: 'rgba(255, 250, 242, 0.055)',
    panelMuted: 'rgba(255, 250, 242, 0.045)',
  },
}

export function themeVars(theme: PromoTheme): CSSProperties {
  return {
    '--promo-background': theme.background,
    '--promo-ambient': theme.ambient,
    '--promo-sheen': theme.sheen,
    '--promo-surface': theme.surface,
    '--promo-surface-soft': theme.surfaceSoft,
    '--promo-surface-elevated': theme.surfaceElevated,
    '--promo-surface-ink': theme.surfaceInk,
    '--promo-surface-muted': theme.surfaceMuted,
    '--promo-surface-faint': theme.surfaceFaint,
    '--promo-surface-border': theme.surfaceBorder,
    '--promo-text': theme.text,
    '--promo-muted': theme.muted,
    '--promo-faint': theme.faint,
    '--promo-accent': theme.accent,
    '--promo-accent-soft': theme.accentSoft,
    '--promo-accent-line': theme.accentLine,
    '--promo-accent-halo': theme.accentHalo,
    '--promo-shadow': theme.shadow,
    '--promo-soft-shadow': theme.softShadow,
    '--promo-line': theme.line,
    '--promo-line-strong': theme.lineStrong,
    '--promo-panel': theme.panel,
    '--promo-panel-soft': theme.panelSoft,
    '--promo-panel-muted': theme.panelMuted,
  } as CSSProperties
}
