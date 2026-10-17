import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    Activity, 
    Clock, 
    Layers, 
    Maximize, 
    Minimize,
    Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Team {
    id: string;
    name: string;
}

interface Match {
    id: string;
    match_number: number;
    round_name: string;
    team1_set1_score?: number;
    team2_set1_score?: number;
    current_game_score?: string;
    server_team?: number;
    team1?: Team;
    team2?: Team;
    court?: { name: string };
    category?: { name: string };
}

interface Props {
    tournament: any;
    liveMatches: Match[];
    upcomingMatches: Match[];
    standingsByCategory: Record<string, Record<string, any[]>>;
}

const SLIDE_DURATION = 10000; // 10 Detik per slide

export default function Slideshow({ tournament, liveMatches, upcomingMatches, standingsByCategory }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const slides = [
        { id: 'live', title: 'Live Match Court Control' },
        { id: 'upcoming', title: 'Jadwal Pertandingan Berikutnya' },
        { id: 'standings', title: 'Klasemen Sementara' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, SLIDE_DURATION);

        return () => clearInterval(interval);
    }, [slides.length]);

    // Data reload for TV venue kiosk
    useEffect(() => {
        const dataInterval = setInterval(() => {
            router.reload({
                only: ['liveMatches', 'upcomingMatches', 'standingsByCategory'],
            });
        }, 20000);

        return () => clearInterval(dataInterval);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-8 overflow-hidden select-none">
            <Head title={`TV Mode: ${tournament.name} - ${brandName}`} />

            {/* TV HEADER BANNER */}
            <header className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Trophy className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                            {tournament.name}
                        </h1>
                        <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                            <span>{tournament.venue_name}</span> &bull; 
                            <span className="text-emerald-400 font-bold uppercase">{slides[currentSlide].title}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Live Clock */}
                    <div className="font-mono text-xl font-black text-emerald-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* TV MAIN SLIDE VIEWPORT */}
            <main className="flex-1 my-6 flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                    {/* SLIDE 1: LIVE MATCHES */}
                    {currentSlide === 0 && (
                        <motion.div
                            key="live"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full flex flex-col justify-center"
                        >
                            {liveMatches.length === 0 ? (
                                <div className="text-center space-y-4">
                                    <Activity className="w-16 h-16 text-slate-700 mx-auto" />
                                    <h2 className="text-3xl font-black text-slate-400">Semua Lapangan Sedang Istirahat</h2>
                                    <p className="text-sm text-slate-500">Pertandingan babak berikutnya segera dimulai.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-8 w-full">
                                    {liveMatches.map((m) => (
                                        <div key={m.id} className="p-8 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 shadow-2xl space-y-6">
                                            <div className="flex items-center justify-between text-sm font-bold text-slate-400">
                                                <span>{m.court?.name} • {m.category?.name}</span>
                                                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-black animate-pulse">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                                    LIVE
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                                                    <div className="flex items-center gap-3 truncate pr-4">
                                                        {m.server_team === 1 && <Sparkles className="w-6 h-6 text-emerald-400" />}
                                                        <span className="text-2xl font-black text-white truncate">{m.team1?.name}</span>
                                                    </div>
                                                    <span className="text-4xl font-black text-emerald-400 font-mono px-4 py-1 rounded-xl bg-slate-900">
                                                        {m.team1_set1_score ?? 0}
                                                    </span>
                                                </div>

                                                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                                                    <div className="flex items-center gap-3 truncate pr-4">
                                                        {m.server_team === 2 && <Sparkles className="w-6 h-6 text-emerald-400" />}
                                                        <span className="text-2xl font-black text-white truncate">{m.team2?.name}</span>
                                                    </div>
                                                    <span className="text-4xl font-black text-emerald-400 font-mono px-4 py-1 rounded-xl bg-slate-900">
                                                        {m.team2_set1_score ?? 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* SLIDE 2: UPCOMING MATCHES */}
                    {currentSlide === 1 && (
                        <motion.div
                            key="upcoming"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full flex flex-col justify-center"
                        >
                            <div className="grid grid-cols-3 gap-6 w-full">
                                {upcomingMatches.slice(0, 6).map((m) => (
                                    <div key={m.id} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
                                        <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                                            <span>{m.court?.name || 'TBD'}</span>
                                            <span className="text-emerald-400">#{m.match_number}</span>
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                            {m.team1?.name} <br />
                                            <span className="text-slate-500 text-xs font-normal">VS</span> <br />
                                            {m.team2?.name}
                                        </div>
                                        <div className="text-xs text-slate-500 font-semibold">
                                            {m.category?.name} &bull; {m.round_name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* SLIDE 3: LEADERBOARD / STANDINGS */}
                    {currentSlide === 2 && (
                        <motion.div
                            key="standings"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full flex flex-col justify-center"
                        >
                            <div className="grid grid-cols-2 gap-8 w-full">
                                {Object.entries(standingsByCategory).slice(0, 2).map(([catId, groups]) => (
                                    <div key={catId} className="space-y-4">
                                        {Object.entries(groups).slice(0, 1).map(([letter, rows]) => (
                                            <div key={letter} className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                                                <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                                                    <h3 className="font-bold text-white text-base">Grup {letter}</h3>
                                                    <span className="text-xs text-emerald-400 font-bold">Top 2 Lolos</span>
                                                </div>
                                                <table className="w-full text-left text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                                                            <th className="py-3 px-4">#</th>
                                                            <th className="py-3 px-4">Tim</th>
                                                            <th className="py-3 px-2 text-center">M</th>
                                                            <th className="py-3 px-2 text-center">W</th>
                                                            <th className="py-3 px-2 text-center">L</th>
                                                            <th className="py-3 px-4 text-center font-bold text-emerald-400">PTS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800/60">
                                                        {rows.slice(0, 4).map((r: any, idx: number) => (
                                                            <tr key={r.team_id} className={idx < 2 ? 'bg-emerald-500/5' : ''}>
                                                                <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                                                                <td className="py-3 px-4 font-bold text-white">{r.team_name}</td>
                                                                <td className="py-3 px-2 text-center text-slate-400">{r.played}</td>
                                                                <td className="py-3 px-2 text-center text-emerald-400">{r.won}</td>
                                                                <td className="py-3 px-2 text-center text-rose-400">{r.lost}</td>
                                                                <td className="py-3 px-4 text-center font-black text-emerald-400 text-sm">{r.points}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* TV FOOTER & SLIDE ROTATION INDICATOR */}
            <footer className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Kiosk Feed {brandName} &bull; Auto-rotasi 10 Detik</span>
                </div>

                <div className="flex items-center gap-3">
                    {slides.map((s, idx) => (
                        <div
                            key={s.id}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                currentSlide === idx ? 'w-10 bg-emerald-400' : 'w-3 bg-slate-800'
                            }`}
                        />
                    ))}
                </div>
            </footer>
        </div>
    );
}
