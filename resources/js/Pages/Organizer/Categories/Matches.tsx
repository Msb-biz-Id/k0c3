import React from 'react';
import { Head, router } from '@inertiajs/react';
import CategoryLayout from './CategoryLayout';
import { 
    Calendar, 
    Sparkles, 
    Activity, 
    CheckCircle2, 
    Clock, 
    Layers,
    MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface MatchItem {
    id: string;
    stage: string;
    round_name: string;
    round_order: number;
    group_letter?: string;
    match_number: number;
    team1?: { id: string; name: string };
    team2?: { id: string; name: string };
    court?: { id: string; name: string };
    status: 'pending' | 'warm_up' | 'on_court' | 'completed';
    team1_set1_score: number;
    team2_set1_score: number;
    team1_set2_score: number;
    team2_set2_score: number;
    team1_set3_score: number;
    team2_set3_score: number;
    winner_team?: { id: string; name: string };
}

interface Props {
    tournament: any;
    category: any;
    matches: MatchItem[];
    courts: any[];
}

export default function CategoryMatches({ tournament, category, matches, courts }: Props) {
    const handleGenerateFixtures = () => {
        router.post(route('organizer.categories.generate-fixtures', [tournament.id, category.id]), {}, {
            onSuccess: () => toast.success('Jadwal pertandingan fase grup berhasil dibuat otomatis!'),
        });
    };

    const groupMatches = matches.filter(m => m.stage === 'group');

    const getStatusPill = (status: string) => {
        switch (status) {
            case 'on_court':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-400/20 text-lime-400 border border-lime-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
                        <span>LIVE ON COURT</span>
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SELESAI</span>
                    </span>
                );
            case 'warm_up':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span>PEMANASAN</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        <Clock className="w-3 h-3" />
                        <span>PENDING</span>
                    </span>
                );
        }
    };

    return (
        <CategoryLayout tournament={tournament} category={category} activeSubTab="matches">
            <Head title={`Jadwal Matches - ${category.name}`} />

            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-base font-bold text-white">Jadwal Pertandingan Fase Grup</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-lime-400/10 text-lime-400 border border-lime-400/20">
                                {groupMatches.length} Pertandingan
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Pertandingan digenerate otomatis menggunakan Algoritma Berger (Circle Method) round-robin.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateFixtures}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition shadow-lg shadow-lime-400/20 active:scale-95"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Jadwal Berger Round-Robin</span>
                    </button>
                </div>

                {/* Match Cards List */}
                {groupMatches.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs space-y-2">
                        <Calendar className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-300">Belum ada pertandingan grup yang dijadwalkan.</p>
                        <p>Pastikan Anda telah melakukan "Undian Grup" di tab Tim terlebih dahulu, lalu klik tombol "Generate Jadwal".</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupMatches.map(match => (
                            <div
                                key={match.id}
                                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-lime-400 text-slate-950">
                                            GRUP {match.group_letter}
                                        </span>
                                        <span className="text-xs font-mono text-slate-400">
                                            #{match.match_number} • {match.round_name}
                                        </span>
                                    </div>
                                    <div>
                                        {getStatusPill(match.status)}
                                    </div>
                                </div>

                                {/* Team 1 vs Team 2 Score Board */}
                                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-bold ${
                                            match.winner_team?.id === match.team1?.id ? 'text-lime-400' : 'text-white'
                                        }`}>
                                            {match.team1?.name || 'TBD'}
                                        </span>
                                        <span className="font-mono text-base font-black text-lime-400">
                                            {match.team1_set1_score}
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-800/80" />

                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-bold ${
                                            match.winner_team?.id === match.team2?.id ? 'text-lime-400' : 'text-white'
                                        }`}>
                                            {match.team2?.name || 'TBD'}
                                        </span>
                                        <span className="font-mono text-base font-black text-lime-400">
                                            {match.team2_set1_score}
                                        </span>
                                    </div>
                                </div>

                                {/* Court Assignment Info */}
                                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                                    <div className="flex items-center space-x-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{match.court?.name || 'Belum Ditugaskan'}</span>
                                    </div>
                                    {match.winner_team && (
                                        <span className="text-[11px] font-bold text-lime-400">
                                            Pemenang: {match.winner_team.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CategoryLayout>
    );
}
