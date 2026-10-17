import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy } from 'lucide-react';

interface Props {
    company?: {
        company_name?: string;
        tagline?: string;
        logo_dark_path?: string;
        enable_preloader?: boolean;
    };
    forceShow?: boolean;
}

export default function Preloader({ company, forceShow = false }: Props) {
    // If preloader is explicitly disabled in settings, do not render
    const isEnabled = company?.enable_preloader ?? true;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isEnabled && !forceShow) {
            setIsLoading(false);
            return;
        }

        // Check if preloader has already played in this browser session to prevent annoyance,
        // unless forceShow is passed (e.g. for testing or preview in admin settings)
        const sessionKey = 'padelgigs_preloader_shown';
        if (!forceShow && sessionStorage.getItem(sessionKey)) {
            setIsLoading(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
            if (!forceShow) {
                sessionStorage.setItem(sessionKey, 'true');
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [isEnabled, forceShow]);

    if (!isEnabled && !forceShow) {
        return null;
    }

    const brandName = company?.company_name || 'Koceevent';

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 selection:bg-emerald-500 selection:text-slate-950 overflow-hidden"
                >
                    {/* Ambient Radial Background Glow */}
                    <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-cyan-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />

                    <div className="relative z-10 flex flex-col items-center space-y-6">
                        {/* Animated SVG Ring & Logo Center */}
                        <div className="relative w-28 h-28 flex items-center justify-center">
                            {/* Rotating SVG Circular Tracer */}
                            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="44"
                                    className="stroke-slate-800/80"
                                    strokeWidth="3"
                                    fill="none"
                                />
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="44"
                                    className="stroke-emerald-400"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="none"
                                    initial={{ strokeDasharray: "280", strokeDashoffset: "280" }}
                                    animate={{ strokeDashoffset: ["280", "40", "0"] }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            </svg>

                            {/* Secondary Outer Pulsing Ring */}
                            <motion.div
                                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-1 rounded-full border border-teal-500/30 blur-[1px]"
                            />

                            {/* Inner Logo Box */}
                            <div className="absolute inset-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl p-2 overflow-hidden">
                                {company?.logo_dark_path ? (
                                    <motion.img
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                        src={`/storage/${company.logo_dark_path}`}
                                        alt={brandName}
                                        className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                    />
                                ) : (
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="text-emerald-400"
                                    >
                                        <Trophy className="w-8 h-8" />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Brand Name & Typography Animation */}
                        <div className="text-center space-y-1.5">
                            <motion.h2
                                initial={{ opacity: 0, y: 10, letterSpacing: "0.2em" }}
                                animate={{ opacity: 1, y: 0, letterSpacing: "0.05em" }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-lg font-black tracking-wider text-white"
                            >
                                {brandName}
                            </motion.h2>
                            {company?.tagline && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold"
                                >
                                    {company.tagline}
                                </motion.p>
                            )}
                        </div>

                        {/* Minimalist Glowing Progress Line */}
                        <div className="w-40 h-1 bg-slate-800/80 rounded-full overflow-hidden relative">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1,
                                    ease: "easeInOut",
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
