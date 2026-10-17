import React from 'react';
import { Head, router } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import CategoryLayout from './CategoryLayout';
import { 
    GitBranch, 
    Trophy, 
    Medal, 
    Calendar, 
    RotateCw, 
    Clock, 
    CheckCircle2, 
    AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface Team {
    id: string;
    name: string;
}

interface Match {
    id: string;
    category_id: string;
    stage: string;
    round_name: string;
    round_order: number;
    match_number: number;
    team1_id?: string;
    team2_id?: string;
    team1?: Team;
    team2?: Team;
    team1_set1_score?: number;
    team2_set1_score?: number;
    winner_team_id?: string;
    winner_team?: Team;
    court?: { id: string; name: string };
    status: 'pending' | 'in_progress' | 'completed';
    next_match_id?: string;
    loser_next_match_id?: string;
}

interface Props {
    tournament: any;
    category: any;
    bracketMatches: Match[];
}

export default function Bracket({ tournament, category, bracketMatches }: Props) {
    const handleGenerateBracket = () => {
        if (confirm('Apakah Anda yakin ingin men-generate bagan gugur (knockout) dari klasemen grup?')) {
            router.post(route('organizer.categories.generate-bracket', [tournament.id, category.id]));
        }
    };

    // Filter rounds
    const semiFinals = bracketMatches.filter(m => m.round_name === 'Semi Final');
    const finalMatch = bracketMatches.find(m => m.round_name === 'Final');
    const bronzeMatch = bracketMatches.find(m => m.round_name === 'Perebutan Juara 3');

    return (
        <OrganizerLayout title={`Bagan Knockout - ${category.name}`}>
            <Head title={`Bagan Knockout - ${category.name}`} />

            <CategoryLayout tournament={tournament} category={category} activeSubTab="bracket">
                <div className="space-y-8">
                    {/* Header Action */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-emerald-400" />
                                Bagan Babak Gugur (Knockout Tree)
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Struktur bagan cross-group otomatis (A1 vs B2, B1 vs A2) menuju Final & Perebutan Juara 3.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGenerateBracket}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
                            >
                                <RotateCw className="w-4 h-4" />
                                {bracketMatches.length > 0 ? 'Re-Generate Bagan' : 'Buat Bagan Otomatis'}
                            </button>
                        </div>
                    </div>

                    {bracketMatches.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                                <GitBranch className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Bagan Belum Dibuat</h3>
                            <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 mb-6">
                                Setelah babak grup selesai, klik tombol di bawah untuk menempatkan juara grup & runner-up ke dalam bagan knockout secara otomatis.
                            </p>
                            <button
                                onClick={handleGenerateBracket}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition"
                            >
                                <GitBranch className="w-4 h-4" />
                                Generate Bagan Sekarang
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Visual Bracket Flow */}
                            <div className="overflow-x-auto pb-8">
                                <div className="min-w-[760px] flex items-center justify-between gap-8 relative px-4">
                                    
                                    {/* SEMI FINALS COLUMN */}
                                    <div className="flex-1 space-y-12">
                                        <div className="text-center">
                                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                Semi Final
                                            </span>
                                        </div>

                                        <div className="space-y-8">
                                            {semiFinals.map((match) => (
                                                <MatchNodeCard key={match.id} match={match} />
                                            ))}
                                            {semiFinals.length === 0 && (
                                                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                                                    Tidak ada babak semifinal (langsung final).
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CONNECTOR ARROWS / SVG BEAM */}
                                    {semiFinals.length > 0 && (
                                        <div className="w-16 flex items-center justify-center text-slate-600">
                                            <svg className="w-full h-48 stroke-slate-700" fill="none" viewBox="0 0 100 200">
                                                <path d="M 0 50 C 50 50, 50 100, 100 100" strokeWidth="2" strokeDasharray="4 4" />
                                                <path d="M 0 150 C 50 150, 50 100, 100 100" strokeWidth="2" strokeDasharray="4 4" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* GRAND FINAL COLUMN */}
                                    <div className="flex-1 space-y-6">
                                        <div className="text-center">
                                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-1.5 w-fit mx-auto">
                                                <Trophy className="w-3.5 h-3.5" />
                                                Grand Final
                                            </span>
                                        </div>

                                        {finalMatch ? (
                                            <div className="relative">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-60" />
                                                <MatchNodeCard match={finalMatch} isFinal />
                                            </div>
                                        ) : (
                                            <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                                                Match Final belum dibuat.
                                            </div>
                                        )}
                                    </div>

                                    {/* BRONZE MATCH COLUMN (IF APPLICABLE) */}
                                    {category.has_third_place && bronzeMatch && (
                                        <div className="flex-1 space-y-6">
                                            <div className="text-center">
                                                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 px-3 py-1 rounded-full bg-amber-900/20 border border-amber-700/30 flex items-center justify-center gap-1.5 w-fit mx-auto">
                                                    <Medal className="w-3.5 h-3.5" />
                                                    Perebutan Juara 3
                                                </span>
                                            </div>

                                            <MatchNodeCard match={bronzeMatch} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CategoryLayout>
        </OrganizerLayout>
    );
}

function MatchNodeCard({ match, isFinal = false }: { match: Match; isFinal?: boolean }) {
    const isCompleted = match.status === 'completed';
    const isLive = match.status === 'in_progress';

    return (
        <motion.div 
            whileHover={{ y: -2 }}
            className={`rounded-2xl border transition-all overflow-hidden ${
                isFinal 
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-xl shadow-amber-500/10' 
                    : 'bg-slate-900/70 border-slate-800 shadow-md'
            }`}
        >
            {/* Card Header */}
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-400">Match #{match.match_number}</span>
                <div className="flex items-center gap-1.5">
                    {isLive && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            LIVE
                        </span>
                    )}
                    {isCompleted && (
                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Selesai
                        </span>
                    )}
                    {!isLive && !isCompleted && (
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                        </span>
                    )}
                </div>
            </div>

            {/* Teams & Scores */}
            <div className="p-4 space-y-2">
                {/* Team 1 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition ${
                    match.winner_team_id === match.team1_id && match.team1_id
                        ? 'bg-emerald-500/15 border border-emerald-500/30' 
                        : 'bg-slate-950/40'
                }`}>
                    <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                        <span className={`text-xs font-semibold truncate ${
                            match.winner_team_id === match.team1_id ? 'text-emerald-300 font-bold' : 'text-slate-300'
                        }`}>
                            {match.team1?.name || 'Pemenang Match Sebelumnya'}
                        </span>
                    </div>
                    <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {match.team1_set1_score ?? '-'}
                    </span>
                </div>

                {/* Team 2 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition ${
                    match.winner_team_id === match.team2_id && match.team2_id
                        ? 'bg-emerald-500/15 border border-emerald-500/30' 
                        : 'bg-slate-950/40'
                }`}>
                    <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                        <span className={`text-xs font-semibold truncate ${
                            match.winner_team_id === match.team2_id ? 'text-emerald-300 font-bold' : 'text-slate-300'
                        }`}>
                            {match.team2?.name || 'Pemenang Match Sebelumnya'}
                        </span>
                    </div>
                    <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {match.team2_set1_score ?? '-'}
                    </span>
                </div>
            </div>

            {/* Court / Info footer */}
            {match.court && (
                <div className="px-4 py-1.5 bg-slate-950/40 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{match.court.name}</span>
                </div>
            )}
        </motion.div>
    );
}
