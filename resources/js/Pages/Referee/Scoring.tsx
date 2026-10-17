import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    Play, 
    RotateCcw, 
    CheckCircle2, 
    Sparkles, 
    Volume2, 
    ShieldCheck, 
    Clock, 
    AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast, Toaster } from 'sonner';

interface Team {
    id: string;
    name: string;
}

interface Match {
    id: string;
    round_name: string;
    match_number: number;
    team1_id?: string;
    team2_id?: string;
    team1?: Team;
    team2?: Team;
    team1_set1_score?: number;
    team2_set1_score?: number;
    current_game_score?: string;
    server_team?: number;
    status: 'pending' | 'in_progress' | 'completed';
    category?: { name: string };
}

interface Court {
    id: string;
    name: string;
    referee_token: string;
}

interface Props {
    court: Court;
    tournament: any;
    activeMatch: Match | null;
    upcomingMatches: Match[];
}

const POINT_SEQUENCE = ['0', '15', '30', '40', 'GP']; // Golden point default

export default function RefereeScoring({ court, tournament, activeMatch, upcomingMatches }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const [t1Score, setT1Score] = useState<number>(activeMatch?.team1_set1_score ?? 0);
    const [t2Score, setT2Score] = useState<number>(activeMatch?.team2_set1_score ?? 0);
    const [t1PointIdx, setT1PointIdx] = useState<number>(0);
    const [t2PointIdx, setT2PointIdx] = useState<number>(0);
    const [serverTeam, setServerTeam] = useState<number>(activeMatch?.server_team ?? 1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    const isMatchLive = activeMatch?.status === 'in_progress';

    const handleStartMatch = () => {
        if (!activeMatch) return;
        router.post(route('referee.matches.start', [court.referee_token, activeMatch.id]), {}, {
            onSuccess: () => toast.success('Match live dimulai!')
        });
    };

    const handleAddPoint = (teamNumber: 1 | 2) => {
        if (!activeMatch || !isMatchLive) return;

        if (teamNumber === 1) {
            const nextIdx = t1PointIdx + 1;
            if (nextIdx >= POINT_SEQUENCE.length) {
                // Game Won by Team 1
                const newT1Game = t1Score + 1;
                setT1Score(newT1Game);
                setT1PointIdx(0);
                setT2PointIdx(0);
                setServerTeam(serverTeam === 1 ? 2 : 1);
                syncScore(newT1Game, t2Score, '0 - 0', serverTeam === 1 ? 2 : 1);
                toast.success(`Game untuk ${activeMatch.team1?.name}!`);
            } else {
                setT1PointIdx(nextIdx);
                const currentScoreStr = `${POINT_SEQUENCE[nextIdx]} - ${POINT_SEQUENCE[t2PointIdx]}`;
                syncScore(t1Score, t2Score, currentScoreStr, serverTeam);
            }
        } else {
            const nextIdx = t2PointIdx + 1;
            if (nextIdx >= POINT_SEQUENCE.length) {
                // Game Won by Team 2
                const newT2Game = t2Score + 1;
                setT2Score(newT2Game);
                setT1PointIdx(0);
                setT2PointIdx(0);
                setServerTeam(serverTeam === 1 ? 2 : 1);
                syncScore(t1Score, newT2Game, '0 - 0', serverTeam === 1 ? 2 : 1);
                toast.success(`Game untuk ${activeMatch.team2?.name}!`);
            } else {
                setT2PointIdx(nextIdx);
                const currentScoreStr = `${POINT_SEQUENCE[t1PointIdx]} - ${POINT_SEQUENCE[nextIdx]}`;
                syncScore(t1Score, t2Score, currentScoreStr, serverTeam);
            }
        }
    };

    const syncScore = (t1Game: number, t2Game: number, currentPoints: string, server: number) => {
        if (!activeMatch) return;
        setIsSubmitting(true);
        router.post(route('referee.matches.score', [court.referee_token, activeMatch.id]), {
            team1_set1_score: t1Game,
            team2_set1_score: t2Game,
            current_game_score: currentPoints,
            server_team: server,
        }, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleFinishMatch = (winnerTeamId: string) => {
        if (!activeMatch) return;

        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
        });

        router.post(route('referee.matches.score', [court.referee_token, activeMatch.id]), {
            team1_set1_score: t1Score,
            team2_set1_score: t2Score,
            is_finish: true,
            winner_team_id: winnerTeamId,
        }, {
            onSuccess: () => {
                setShowFinishConfirm(false);
                toast.success('Pertandingan resmi selesai! Skor telah terkunci.');
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
            <Head title={`Wasit: ${court.name} - ${brandName}`} />
            <Toaster position="top-center" richColors />

            {/* Top Bar Header */}
            <header className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h1 className="text-base font-black text-white">{court.name}</h1>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {tournament.name}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {court.referee_token}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                </div>
            </header>

            {/* Main Referee Scoring Area */}
            <main className="p-4 max-w-lg mx-auto w-full flex-1 flex flex-col justify-center space-y-6">
                {!activeMatch ? (
                    <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-6 space-y-3">
                        <Clock className="w-12 h-12 text-slate-600 mx-auto" />
                        <h2 className="text-lg font-bold text-white">Tidak Ada Pertandingan Aktif</h2>
                        <p className="text-xs text-slate-400">
                            Tournament Desk belum menugaskan pertandingan ke lapangan ini.
                        </p>
                    </div>
                ) : !isMatchLive ? (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
                        <div className="space-y-1">
                            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
                                {activeMatch.category?.name} • Match #{activeMatch.match_number}
                            </span>
                            <h2 className="text-xl font-black text-white pt-2">
                                {activeMatch.round_name}
                            </h2>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <div className="text-base font-bold text-white truncate">
                                {activeMatch.team1?.name}
                            </div>
                            <div className="text-xs text-slate-500 uppercase font-black">VS</div>
                            <div className="text-base font-bold text-white truncate">
                                {activeMatch.team2?.name}
                            </div>
                        </div>

                        <button
                            onClick={handleStartMatch}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-95"
                        >
                            <Play className="w-5 h-5 fill-slate-950" />
                            MULAI PERTANDINGAN
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Match Info Header */}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-2">
                            <span>{activeMatch.category?.name} • #{activeMatch.match_number}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                LIVE SCORING
                            </span>
                        </div>

                        {/* Split Scoreboard */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* TEAM 1 CARD */}
                            <motion.div 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAddPoint(1)}
                                className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-56 select-none ${
                                    serverTeam === 1 
                                        ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30' 
                                        : 'bg-slate-900/60 border-slate-800'
                                }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TIM 1</span>
                                        {serverTeam === 1 && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                SERVE
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-base text-white line-clamp-2">
                                        {activeMatch.team1?.name}
                                    </h3>
                                </div>

                                {/* Center Big Point */}
                                <div className="text-center my-auto">
                                    <span className="text-5xl font-black text-emerald-400 tracking-tight">
                                        {POINT_SEQUENCE[t1PointIdx]}
                                    </span>
                                </div>

                                {/* Footer Games Count */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                                    <span className="text-slate-400 font-semibold">Games:</span>
                                    <span className="text-lg font-black text-white px-2 rounded bg-slate-950">
                                        {t1Score}
                                    </span>
                                </div>
                            </motion.div>

                            {/* TEAM 2 CARD */}
                            <motion.div 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAddPoint(2)}
                                className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-56 select-none ${
                                    serverTeam === 2 
                                        ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30' 
                                        : 'bg-slate-900/60 border-slate-800'
                                }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TIM 2</span>
                                        {serverTeam === 2 && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                SERVE
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-base text-white line-clamp-2">
                                        {activeMatch.team2?.name}
                                    </h3>
                                </div>

                                {/* Center Big Point */}
                                <div className="text-center my-auto">
                                    <span className="text-5xl font-black text-emerald-400 tracking-tight">
                                        {POINT_SEQUENCE[t2PointIdx]}
                                    </span>
                                </div>

                                {/* Footer Games Count */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                                    <span className="text-slate-400 font-semibold">Games:</span>
                                    <span className="text-lg font-black text-white px-2 rounded bg-slate-950">
                                        {t2Score}
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Controls Toolbar */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setServerTeam(serverTeam === 1 ? 2 : 1)}
                                className="py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-95"
                            >
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                Ganti Server
                            </button>
                            <button
                                onClick={() => setShowFinishConfirm(true)}
                                className="py-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center gap-2 hover:bg-amber-500/20 transition active:scale-95"
                            >
                                <Trophy className="w-4 h-4 text-amber-400" />
                                Akhiri Pertandingan
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Finish Confirmation Modal */}
            {showFinishConfirm && activeMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
                    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
                            <h3 className="text-lg font-black text-white">Konfirmasi Pemenang</h3>
                            <p className="text-xs text-slate-400">
                                Skor akhir: <strong className="text-emerald-400">{t1Score} - {t2Score}</strong>. Pilih tim yang memenangkan pertandingan:
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleFinishMatch(activeMatch.team1_id!)}
                                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 font-bold text-sm text-left flex items-center justify-between transition"
                            >
                                <span className="truncate pr-2">{activeMatch.team1?.name}</span>
                                <span className="font-mono font-black">{t1Score}</span>
                            </button>
                            <button
                                onClick={() => handleFinishMatch(activeMatch.team2_id!)}
                                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 font-bold text-sm text-left flex items-center justify-between transition"
                            >
                                <span className="truncate pr-2">{activeMatch.team2?.name}</span>
                                <span className="font-mono font-black">{t2Score}</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowFinishConfirm(false)}
                            className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-semibold text-xs hover:bg-slate-700 transition"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Status Footer */}
            <footer className="px-5 py-3 bg-slate-950 border-t border-slate-900 text-center text-[10px] text-slate-600">
                {brandName} Wasit Terminal • Pessimistic Lock Active
            </footer>
        </div>
    );
}
