import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';

export type ThemeMode = 'dark' | 'light' | 'auto';

export default function DarkModeToggle({ className = '' }: { className?: string }) {
    const [mode, setMode] = useState<ThemeMode>('auto');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Read stored theme mode or default to 'auto'
    useEffect(() => {
        const stored = (localStorage.getItem('app_theme_mode') as ThemeMode) || 'auto';
        setMode(stored);
        applyTheme(stored);
    }, []);

    // Listen to OS dark mode changes if in 'auto' mode
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (mode === 'auto') {
                applyTheme('auto');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mode]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const applyTheme = (selectedMode: ThemeMode) => {
        const root = document.documentElement;
        let isDark = true;

        if (selectedMode === 'dark') {
            isDark = true;
        } else if (selectedMode === 'light') {
            isDark = false;
        } else {
            // Auto / System
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        if (isDark) {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }

        root.setAttribute('data-theme-mode', selectedMode);
    };

    const handleSelect = (newMode: ThemeMode) => {
        setMode(newMode);
        try {
            localStorage.setItem('app_theme_mode', newMode);
        } catch {
            // Ignore storage errors in restricted contexts
        }
        applyTheme(newMode);
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Pengaturan Mode Gelap / Terang / Otomatis"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition shadow-sm text-xs"
                title={`Mode Tampilan: ${mode === 'dark' ? 'Gelap' : mode === 'light' ? 'Terang' : 'Otomatis (Sistem)'}`}
            >
                {mode === 'dark' && <Moon className="w-4 h-4 text-sky-400" />}
                {mode === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
                {mode === 'auto' && <Laptop className="w-4 h-4 text-emerald-400" />}
                <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in-50 zoom-in-95">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
                        Mode Tampilan
                    </div>

                    <button
                        type="button"
                        onClick={() => handleSelect('auto')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                            mode === 'auto'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Laptop className="w-4 h-4 text-emerald-400" />
                            Otomatis
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Sistem</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelect('dark')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                            mode === 'dark'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Moon className="w-4 h-4 text-sky-400" />
                            Mode Gelap
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Dark</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelect('light')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                            mode === 'light'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-amber-400" />
                            Mode Terang
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Light</span>
                    </button>
                </div>
            )}
        </div>
    );
}
