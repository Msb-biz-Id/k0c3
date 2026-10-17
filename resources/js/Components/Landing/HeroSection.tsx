import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Search, ShieldCheck, Trophy, Radio, MapPin } from 'lucide-react';

export interface HeroSlide {
    id: string;
    badge_text?: string;
    title: string;
    subtitle?: string;
    image_path?: string;
    cta_text?: string;
    cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    slides: HeroSlide[];
    search: string;
    onSearchChange: (value: string) => void;
    selectedProvince: string;
    onProvinceChange: (value: string) => void;
    provinces: any[];
    onSearchSubmit: (e: React.FormEvent) => void;
}

export default function HeroSection({
    slides,
    search,
    onSearchChange,
    selectedProvince,
    onProvinceChange,
    provinces,
    onSearchSubmit,
}: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const activeSlides = (Array.isArray(slides) ? slides : []).filter(s => s && s.is_active);

    const fallbackSlide: HeroSlide = {
        id: 'default-hero-slide',
        badge_text: 'Official Sports Tournament Network',
        title: 'Temukan Turnamen & Taklukkan Arena Kejuaraan',
        subtitle: 'Platform ekosistem turnamen terlengkap di Indonesia. Skor real-time wasit, undian grup terisolasi, dan bagan sistem gugur otomatis di 38 Provinsi.',
        cta_text: 'Jelajahi Turnamen',
        cta_link: '#tournaments',
        secondary_cta_text: 'Hall of Fame Atlet',
        secondary_cta_link: '#athletes',
        sort_order: 1,
        is_active: true,
    };

    const effectiveSlides = activeSlides.length > 0 ? activeSlides : [fallbackSlide];

    useEffect(() => {
        if (effectiveSlides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % effectiveSlides.length);
        }, 6500);
        return () => clearInterval(interval);
    }, [effectiveSlides.length]);

    const currentSlide = effectiveSlides[currentIndex] || effectiveSlides[0];

    return (
        <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
            {/* Dynamic Background Atmosphere Beam */}
            <div 
                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[350px] sm:h-[450px] rounded-full blur-[140px] pointer-events-none opacity-20"
                style={{ backgroundColor: 'var(--app-accent, #a3e635)' }}
            />

            <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-6"
                    >
                        {/* Slide Badge Pill */}
                        {currentSlide.badge_text && (
                            <div 
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border"
                                style={{
                                    backgroundColor: 'var(--app-accent-glow, rgba(163, 230, 53, 0.12))',
                                    borderColor: 'var(--app-accent, #a3e635)',
                                    color: 'var(--app-accent, #a3e635)'
                                }}
                            >
                                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--app-accent, #a3e635)' }} />
                                <Sparkles className="w-3.5 h-3.5" />
                                {currentSlide.badge_text}
                            </div>
                        )}

                        {/* Slide Headline */}
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] font-heading">
                            {currentSlide.title}
                        </h1>

                        {/* Slide Subtitle */}
                        {currentSlide.subtitle && (
                            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                {currentSlide.subtitle}
                            </p>
                        )}

                        {/* Slide Banner Background Image (if configured) */}
                        {currentSlide.image_path && (
                            <div className="max-w-3xl mx-auto h-48 sm:h-64 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
                                <img
                                    src={`/storage/${currentSlide.image_path}`}
                                    alt={currentSlide.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                            </div>
                        )}

                        {/* CTA Buttons */}
                        {(currentSlide.cta_text || currentSlide.secondary_cta_text) && (
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                {currentSlide.cta_text && (
                                    <a
                                        href={currentSlide.cta_link || '#tournaments'}
                                        className="px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl transition flex items-center gap-2 group transform hover:-translate-y-0.5"
                                        style={{
                                            backgroundColor: 'var(--app-accent, #a3e635)',
                                            color: '#020617',
                                            boxShadow: '0 10px 25px -5px var(--app-accent-glow, rgba(163, 230, 53, 0.3))'
                                        }}
                                    >
                                        {currentSlide.cta_text}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                )}
                                {currentSlide.secondary_cta_text && (
                                    <a
                                        href={currentSlide.secondary_cta_link || '#athletes'}
                                        className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition transform hover:-translate-y-0.5"
                                    >
                                        {currentSlide.secondary_cta_text}
                                    </a>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Carousel Navigation Indicators */}
                {effectiveSlides.length > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev - 1 + effectiveSlides.length) % effectiveSlides.length)}
                            className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                            title="Slide Sebelumnya"
                            aria-label="Slide Sebelumnya"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1.5">
                            {effectiveSlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    aria-label={`Pindah ke slide ${idx + 1}`}
                                    className={`h-2 rounded-full transition-all ${
                                        currentIndex === idx
                                            ? 'w-7'
                                            : 'w-2 bg-slate-700 hover:bg-slate-600'
                                    }`}
                                    style={currentIndex === idx ? { backgroundColor: 'var(--app-accent, #a3e635)' } : undefined}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev + 1) % effectiveSlides.length)}
                            className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                            title="Slide Berikutnya"
                            aria-label="Slide Berikutnya"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Tactical Search Box */}
                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    onSubmit={onSearchSubmit}
                    className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800/90 rounded-3xl p-3 shadow-2xl flex flex-col sm:flex-row items-center gap-3 backdrop-blur-xl mt-6"
                >
                    <div className="flex-1 flex items-center gap-2 px-3 w-full">
                        <Search className="w-5 h-5 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari nama kejuaraan, arena venue, atau kota..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:ring-0"
                        />
                    </div>

                    <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

                    <div className="w-full sm:w-56 px-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                        <select
                            value={selectedProvince}
                            onChange={(e) => onProvinceChange(e.target.value)}
                            className="w-full bg-transparent border-0 text-xs font-semibold text-slate-200 focus:ring-0 cursor-pointer"
                        >
                            <option value="" className="bg-slate-900 text-white">Seluruh Wilayah (38 Provinsi)</option>
                            {(Array.isArray(provinces) ? provinces : []).map((prov) => (
                                <option key={prov.code} value={prov.code} className="bg-slate-900 text-white">
                                    {prov.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition shrink-0 transform hover:-translate-y-0.5"
                        style={{
                            backgroundColor: 'var(--app-accent, #a3e635)',
                            color: '#020617',
                            boxShadow: '0 8px 20px -4px var(--app-accent-glow, rgba(163, 230, 53, 0.25))'
                        }}
                    >
                        Cari Turnamen
                    </button>
                </motion.form>

                {/* Broadcast Key Features Micro Ticker */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        Live Score Wasit Real-Time
                    </span>
                    <span className="hidden sm:inline text-slate-700">•</span>
                    <span className="flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        Bagan Gugur & Undian Otomatis
                    </span>
                    <span className="hidden sm:inline text-slate-700">•</span>
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                        Jaringan Resmi 38 Provinsi
                    </span>
                </div>
            </div>
        </section>
    );
}
