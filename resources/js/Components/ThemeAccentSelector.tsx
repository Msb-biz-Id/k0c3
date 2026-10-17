import React, { useState, useEffect } from 'react';
import { Palette, Check, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    THEME_PALETTES, 
    TYPOGRAPHY_PRESETS, 
    applyPlatformTheme, 
    applyTypographyPreset 
} from '@/Utils/theme';

export const ACCENT_PRESETS = Object.values(THEME_PALETTES);

export default function ThemeAccentSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'accent' | 'typography'>('accent');
    const [activeTheme, setActiveTheme] = useState<string>('lime');
    const [activeTypo, setActiveTypo] = useState<string>('athletic_broadcast');

    useEffect(() => {
        const savedTheme = localStorage.getItem('koceevent_accent_theme');
        if (savedTheme) {
            setActiveTheme(savedTheme);
        }
        const savedTypo = localStorage.getItem('koceevent_typography_preset');
        if (savedTypo) {
            setActiveTypo(savedTypo);
        }
    }, []);

    const handleSelectTheme = (themeId: string) => {
        setActiveTheme(themeId);
        applyPlatformTheme(themeId, undefined, activeTypo);
    };

    const handleSelectTypography = (typoId: string) => {
        setActiveTypo(typoId);
        applyTypographyPreset(typoId);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-white transition-all shadow-sm"
                title="Pilih Warna Aksen & Tipografi"
            >
                <Palette className="h-3.5 w-3.5 text-accent-primary" />
                <span className="hidden sm:inline">Tema & Font</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-2 z-50 w-72 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl backdrop-blur-xl"
                        >
                            {/* Tab Switcher: Accent vs Typography */}
                            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl mb-3 border border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('accent')}
                                    className={`py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                                        activeTab === 'accent'
                                            ? 'bg-slate-800 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <Palette className="w-3.5 h-3.5 text-accent-primary" />
                                    Warna Aksen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('typography')}
                                    className={`py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                                        activeTab === 'typography'
                                            ? 'bg-slate-800 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <Type className="w-3.5 h-3.5 text-accent-primary" />
                                    Tipografi
                                </button>
                            </div>

                            {activeTab === 'accent' ? (
                                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                    {ACCENT_PRESETS.map((t) => {
                                        const isSelected = activeTheme === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => handleSelectTheme(t.id)}
                                                className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all ${
                                                    isSelected
                                                        ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-700'
                                                        : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className="h-4 w-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                                                        style={{ backgroundColor: t.color }}
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-slate-200">{t.name}</p>
                                                        <p className="text-[10px] text-slate-500">{t.desc}</p>
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4 text-accent-primary shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {Object.values(TYPOGRAPHY_PRESETS).map((p) => {
                                        const isSelected = activeTypo === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => handleSelectTypography(p.id)}
                                                className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                                                    isSelected
                                                        ? 'bg-slate-800 border-accent-primary/50 ring-1 ring-accent-primary/30 text-white'
                                                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-white">
                                                        {p.name}
                                                    </span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-accent-primary" />}
                                                </div>
                                                <p className="text-[10px] text-slate-400 line-clamp-1">{p.desc}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
