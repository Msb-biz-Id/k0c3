import React, { useState, useEffect } from 'react';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { 
    THEME_PALETTES, 
    TYPOGRAPHY_PRESETS, 
    ThemePalette, 
    TypographyPreset, 
    applyPlatformTheme, 
    applyTypographyPreset 
} from '@/Utils/theme';
import { Check, Sparkles, Moon, Monitor, Type, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function Appearance() {
    const [activeTheme, setActiveTheme] = useState<string>('lime');
    const [customHex, setCustomHex] = useState<string>('#a3e635');
    const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
    const [activeTypo, setActiveTypo] = useState<string>('athletic_broadcast');

    useEffect(() => {
        const savedTheme = localStorage.getItem('koceevent_accent_theme');
        if (savedTheme) {
            if (savedTheme.startsWith('#')) {
                setIsCustomMode(true);
                setCustomHex(savedTheme);
                applyPlatformTheme(undefined, savedTheme);
            } else {
                setActiveTheme(savedTheme);
                applyPlatformTheme(savedTheme);
            }
        }

        const savedTypo = localStorage.getItem('koceevent_typography_preset');
        if (savedTypo) {
            setActiveTypo(savedTypo);
            applyTypographyPreset(savedTypo);
        }
    }, []);

    const handleSelectPreset = (theme: ThemePalette) => {
        setIsCustomMode(false);
        setActiveTheme(theme.id);
        applyPlatformTheme(theme.id, undefined, activeTypo);
        toast.success(`Aksen tema "${theme.name}" aktif!`);
    };

    const handleCustomColorChange = (hex: string) => {
        setCustomHex(hex);
        if (hex.length === 7 && hex.startsWith('#')) {
            setIsCustomMode(true);
            applyPlatformTheme(undefined, hex, activeTypo);
        }
    };

    const handleSelectTypography = (typo: TypographyPreset) => {
        setActiveTypo(typo.id);
        applyTypographyPreset(typo.id);
        toast.success(`Tipografi "${typo.name}" aktif!`);
    };

    return (
        <SettingsLayout title="Tampilan & Aksen Tema">
            <div className="space-y-8 max-w-4xl font-sans">
                {/* 1. Dynamic Accent Color Engine */}
                <div className="p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Palette className="w-5 h-5 text-accent-primary" />
                            Dynamic Accent Color Engine
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Pilih warna aksen khas lapangan olahraga broadcast untuk tombol aksi, skor live, dan glow visual di seluruh sistem (DESIGN.md Section 2.1).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.values(THEME_PALETTES).map((theme) => {
                            const isSelected = !isCustomMode && activeTheme === theme.id;
                            return (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => handleSelectPreset(theme)}
                                    className={`relative p-5 rounded-2xl text-left border transition group flex flex-col justify-between ${
                                        isSelected
                                            ? 'bg-slate-800/80 border-2 shadow-xl ring-1'
                                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                    }`}
                                    style={{
                                        borderColor: isSelected ? theme.color : undefined,
                                        boxShadow: isSelected ? `0 10px 25px -5px ${theme.glow}` : undefined,
                                    }}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div
                                                className="w-8 h-8 rounded-full border border-white/20 shadow-inner flex items-center justify-center"
                                                style={{ backgroundColor: theme.color }}
                                            >
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                                                )}
                                            </div>
                                            {isSelected && (
                                                <span
                                                    className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-slate-950"
                                                    style={{ backgroundColor: theme.color }}
                                                >
                                                    Aktif
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm font-bold text-white group-hover:text-slate-100">
                                            {theme.name}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {theme.desc}
                                        </div>
                                    </div>

                                    {/* Preview Swatch Bar */}
                                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5">
                                        <div
                                            className="h-2 rounded-full flex-1"
                                            style={{ backgroundColor: theme.color }}
                                        />
                                        <div
                                            className="h-2 rounded-full w-6"
                                            style={{ backgroundColor: theme.hoverColor }}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Hex / HSL Picker */}
                    <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-bold text-white">Custom Brand Hex Color</h4>
                            <p className="text-xs text-slate-400">Gunakan kode warna heksadesimal kustom sponsor turnamen</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={customHex}
                                onChange={(e) => handleCustomColorChange(e.target.value)}
                                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer p-0"
                            />
                            <input
                                type="text"
                                value={customHex}
                                onChange={(e) => handleCustomColorChange(e.target.value)}
                                placeholder="#a3e635"
                                className="w-28 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-white uppercase focus:border-accent-primary focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Dynamic Typography Engine */}
                <div className="p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Type className="w-5 h-5 text-accent-primary" />
                            Dynamic Typography Switcher
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Pilih kombinasi tipografi bersertifikasi tinggi untuk heading, data keterbacaan, dan stopwatch token (DESIGN.md Section 2.2).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {Object.values(TYPOGRAPHY_PRESETS).map((preset) => {
                            const isSelected = activeTypo === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleSelectTypography(preset)}
                                    className={`p-5 rounded-2xl text-left border transition flex flex-col justify-between ${
                                        isSelected
                                            ? 'bg-slate-800/90 border-2 border-accent-primary shadow-xl ring-1 ring-accent-primary/20'
                                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="space-y-3 w-full">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white">
                                                {preset.name}
                                            </span>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center text-slate-950">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Sample Visual Typography Card */}
                                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                                            <div style={{ fontFamily: preset.headingFont }} className="text-lg font-black text-white leading-tight">
                                                FINAL CHAMPIONSHIP 2026
                                            </div>
                                            <div style={{ fontFamily: preset.bodyFont }} className="text-xs text-slate-400 leading-relaxed">
                                                Center Court Kemang • Babak Semifinal
                                            </div>
                                            <div style={{ fontFamily: preset.monoFont }} className="text-[11px] font-mono text-accent-primary font-bold">
                                                LIVE 40 - 15 • 00:48:12
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-slate-400 leading-snug">
                                            {preset.desc}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Dark Mode & Venue TV Mode Info */}
                <div className="p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Moon className="w-5 h-5 text-accent-primary" />
                        Mode Tampilan & Kiosk Venue
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Dirancang dengan antarmuka <strong className="text-slate-200">Ultra-High Contrast Dark Mode</strong> standar turnamen dunia (World Padel Tour & FIP). Tampilan ini ramah di mata untuk wasit outdoor di siang terik maupun penonton proyektor arena indoor 16:9.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                        <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-accent-primary flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            16:9 Venue Kiosk Mode Aktif di /slideshow
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
