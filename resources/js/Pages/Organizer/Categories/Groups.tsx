import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import CategoryLayout from './CategoryLayout';
import { 
    Trophy, 
    ArrowRight, 
    Users, 
    CheckCircle2, 
    Info, 
    RotateCw, 
    GitBranch,
    ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

interface StandingRow {
    team_id: string;
    team_name: string;
    played: number;
    won: number;
    lost: number;
    points: number;
    games_won: number;
    games_lost: number;
    game_diff: number;
}

interface Props {
    tournament: any;
    category: any;
    standings: Record<string, StandingRow[]>;
}

export default function Groups({ tournament, category, standings }: Props) {
    const advancingCount = category.advancing_per_group || 2;
    const groupLetters = Object.keys(standings).sort();

    const handleGenerateBracket = () => {
        if (confirm('Generate bagan knockout berdasarkan posisi klasemen saat ini? (Bagan lama yang belum bertanding akan di-reset)')) {
            router.post(route('organizer.categories.generate-bracket', [tournament.id, category.id]));
        }
    };

    return (
        <OrganizerLayout title={`Klasemen Grup - ${category.name}`}>
            <Head title={`Klasemen Grup - ${category.name}`} />

            <CategoryLayout tournament={tournament} category={category} activeSubTab="groups">
                <div className="space-y-8">
                    {/* Header Action & Tie Breaker Rule Alert */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                Klasemen Babak Grup & Tie-Breaker
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Penentuan peringkat otomatis sesuai regulasi Padel: Top {advancingCount} tim per grup lolos ke babak gugur.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.reload({ only: ['standings'] })}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 transition"
                            >
                                <RotateCw className="w-4 h-4" />
                                Refresh Klasemen
                            </button>
                            <button
                                onClick={handleGenerateBracket}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
                            >
                                <GitBranch className="w-4 h-4" />
                                Buat Bagan Knockout
                            </button>
                        </div>
                    </div>

                    {/* 6-Level Tie-Breaker Explanation Badge */}
                    <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-start gap-3 text-xs text-blue-200/90 leading-relaxed">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                            <span className="font-semibold text-blue-300">Urutan Prioritas Tie-Breaker Resmi:</span>
                            <span className="text-blue-200/80"> 1. Total Poin (Menang=2, Kalah=0) &rarr; 2. Head-to-Head Pertandingan Langsung &rarr; 3. Selisih Game (Game Diff) &rarr; 4. Total Game Menang &rarr; 5. Sedikit Game Kalah &rarr; 6. Alfabetis Tim.</span>
                        </div>
                    </div>

                    {/* Group Standings Tables */}
                    {groupLetters.length === 0 ? (
                        <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8">
                            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <h3 className="text-base font-semibold text-slate-300">Belum Ada Grup / Tim Diundi</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                                Silakan jalankan Undian Tim Seimbang terlebih dahulu di tab Tim & Peserta.
                            </p>
                            <Link
                                href={route('organizer.tournaments.categories.teams', [tournament.id, category.id])}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-emerald-500/20"
                            >
                                Pergi ke Undian Tim
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {groupLetters.map((groupLetter) => {
                                const rows = standings[groupLetter] || [];
                                return (
                                    <motion.div 
                                        key={groupLetter}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                                    >
                                        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black flex items-center justify-center text-sm">
                                                    {groupLetter}
                                                </div>
                                                <h3 className="text-base font-bold text-white">
                                                    Grup {groupLetter}
                                                </h3>
                                            </div>
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium">
                                                Top {advancingCount} Lolos
                                            </span>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-800/80 text-slate-400 uppercase tracking-wider bg-slate-950/40">
                                                        <th className="py-3 px-4 w-12 text-center">#</th>
                                                        <th className="py-3 px-4">Pasangan Tim</th>
                                                        <th className="py-3 px-2 text-center" title="Main">M</th>
                                                        <th className="py-3 px-2 text-center" title="Menang">W</th>
                                                        <th className="py-3 px-2 text-center" title="Kalah">L</th>
                                                        <th className="py-3 px-3 text-center font-bold text-emerald-400" title="Poin">PTS</th>
                                                        <th className="py-3 px-2 text-center text-slate-400" title="Game Menang-Kalah">GM-GK</th>
                                                        <th className="py-3 px-3 text-center font-semibold text-slate-200" title="Selisih Game">DIFF</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/50">
                                                    {rows.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={8} className="py-8 text-center text-slate-500">
                                                                Belum ada tim di grup ini.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        rows.map((row, idx) => {
                                                            const isAdvancing = idx < advancingCount;
                                                            return (
                                                                <tr 
                                                                    key={row.team_id}
                                                                    className={`transition-colors hover:bg-slate-800/30 ${
                                                                        isAdvancing ? 'bg-emerald-500/5' : ''
                                                                    }`}
                                                                >
                                                                    <td className="py-3.5 px-4 text-center font-bold">
                                                                        <div className="flex items-center justify-center">
                                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                                                                isAdvancing 
                                                                                    ? 'bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                                                                    : 'text-slate-500'
                                                                            }`}>
                                                                                {idx + 1}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3.5 px-4">
                                                                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                                                                            {row.team_name}
                                                                            {isAdvancing && (
                                                                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                                                    Lolos
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3.5 px-2 text-center text-slate-400 font-medium">{row.played}</td>
                                                                    <td className="py-3.5 px-2 text-center text-emerald-400 font-medium">{row.won}</td>
                                                                    <td className="py-3.5 px-2 text-center text-rose-400 font-medium">{row.lost}</td>
                                                                    <td className="py-3.5 px-3 text-center font-black text-emerald-400 text-sm bg-slate-950/20">{row.points}</td>
                                                                    <td className="py-3.5 px-2 text-center text-slate-400">{row.games_won}-{row.games_lost}</td>
                                                                    <td className={`py-3.5 px-3 text-center font-bold ${
                                                                        row.game_diff > 0 
                                                                            ? 'text-emerald-400' 
                                                                            : row.game_diff < 0 
                                                                            ? 'text-rose-400' 
                                                                            : 'text-slate-400'
                                                                    }`}>
                                                                        {row.game_diff > 0 ? `+${row.game_diff}` : row.game_diff}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Qualification Cutoff Legend */}
                                        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />
                                            <span>Zona Hijau Lolos ke Babak Knockout (Posisi 1 s/d {advancingCount})</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CategoryLayout>
        </OrganizerLayout>
    );
}
