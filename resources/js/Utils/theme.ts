export interface ThemePalette {
    id: string;
    name: string;
    color: string;
    hoverColor: string;
    glow: string;
    desc: string;
}

export interface TypographyPreset {
    id: string;
    name: string;
    headingFont: string;
    bodyFont: string;
    monoFont: string;
    desc: string;
}

export const THEME_PALETTES: Record<string, ThemePalette> = {
    lime: {
        id: 'lime',
        name: 'Volt Padel Lime (Default)',
        color: '#a3e635',
        hoverColor: '#84cc16',
        glow: 'rgba(163, 230, 53, 0.18)',
        desc: 'Warna resmi bola padel neon broadcast',
    },
    cyan: {
        id: 'cyan',
        name: 'WPT Cyan Blue',
        color: '#0284c7',
        hoverColor: '#0369a1',
        glow: 'rgba(2, 132, 199, 0.18)',
        desc: 'Karpet lapangan Premier Padel internasional',
    },
    amber: {
        id: 'amber',
        name: 'Clay Court Amber',
        color: '#f59e0b',
        hoverColor: '#d97706',
        glow: 'rgba(245, 158, 11, 0.18)',
        desc: 'Warna tanah liat lapangan Spanyol klasik',
    },
    emerald: {
        id: 'emerald',
        name: 'Emerald Stadium',
        color: '#10b981',
        hoverColor: '#059669',
        glow: 'rgba(16, 185, 129, 0.18)',
        desc: 'Rumput lapangan hijau tua arena kejuaraan',
    },
    violet: {
        id: 'violet',
        name: 'Hyper Violet / Night',
        color: '#8b5cf6',
        hoverColor: '#7c3aed',
        glow: 'rgba(139, 92, 246, 0.18)',
        desc: 'Sesi malam turnamen indoor bertekanan tinggi',
    },
};

export const TYPOGRAPHY_PRESETS: Record<string, TypographyPreset> = {
    athletic_broadcast: {
        id: 'athletic_broadcast',
        name: 'Preset A: Athletic Broadcast (Default)',
        headingFont: "'Outfit', sans-serif",
        bodyFont: "'Inter', sans-serif",
        monoFont: "'JetBrains Mono', monospace",
        desc: 'Outfit (Headings/Skor) + Inter (Data) + JetBrains Mono (Stopwatch)',
    },
    clean_tech: {
        id: 'clean_tech',
        name: 'Preset B: Clean Tech Minimal',
        headingFont: "'Plus Jakarta Sans', sans-serif",
        bodyFont: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        monoFont: "'JetBrains Mono', monospace",
        desc: 'Plus Jakarta Sans + Geist Sans UI + Geist Mono',
    },
    classic_championship: {
        id: 'classic_championship',
        name: 'Preset C: Classic Championship',
        headingFont: "'DM Sans', sans-serif",
        bodyFont: "'DM Sans', sans-serif",
        monoFont: "'Fira Code', monospace",
        desc: 'Cabinet Grotesk / DM Sans + Fira Code monospace',
    },
};

export function applyTypographyPreset(presetId?: string) {
    if (typeof window === 'undefined') return;

    const selectedId = presetId && TYPOGRAPHY_PRESETS[presetId] ? presetId : 'athletic_broadcast';
    const preset = TYPOGRAPHY_PRESETS[selectedId];

    document.documentElement.style.setProperty('--font-heading', preset.headingFont);
    document.documentElement.style.setProperty('--font-body', preset.bodyFont);
    document.documentElement.style.setProperty('--font-mono', preset.monoFont);
    document.documentElement.setAttribute('data-typography', selectedId);
    try {
        localStorage.setItem('koceevent_typography_preset', selectedId);
    } catch {
        // Ignore storage errors in private browsing
    }
}

export function applyPlatformTheme(presetId?: string, customHex?: string, typographyPreset?: string) {
    if (typeof window === 'undefined') return;

    let color = '#a3e635';
    let hoverColor = '#84cc16';
    let glow = 'rgba(163, 230, 53, 0.18)';

    if (customHex && customHex.startsWith('#')) {
        color = customHex;
        hoverColor = customHex;
        glow = `${customHex}2e`;
    } else if (presetId && THEME_PALETTES[presetId]) {
        const theme = THEME_PALETTES[presetId];
        color = theme.color;
        hoverColor = theme.hoverColor;
        glow = theme.glow;
    }

    document.documentElement.style.setProperty('--app-accent', color);
    document.documentElement.style.setProperty('--app-accent-hover', hoverColor);
    document.documentElement.style.setProperty('--app-accent-glow', glow);
    document.documentElement.style.setProperty('--app-primary', color);
    document.documentElement.setAttribute('data-accent', presetId || 'lime');

    try {
        localStorage.setItem('koceevent_accent_theme', presetId || 'lime');
    } catch {
        // Ignore storage errors
    }

    if (typographyPreset) {
        applyTypographyPreset(typographyPreset);
    }
}
