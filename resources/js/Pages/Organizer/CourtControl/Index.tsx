import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    LayoutGrid, 
    Clock, 
    Play, 
    CheckCircle2, 
    ArrowRight, 
    QrCode, 
    Copy, 
    Megaphone, 
    Trophy, 
    PlusCircle,
    Layers,
    Activity,
    ExternalLink,
    PhoneCall
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface Team {
    id: string;
    name: string;
}

interface Match {
    id: string;
    stage: string;
    round_name: string;
    match_number: number;
    team1_id?: string;
    team2_id?: string;
    team1?: Team;
    team2?: Team;
    status: 'pending' | 'in_progress' | 'completed';
    team1_set1_score?: number;
    team2_set1_score?: number;
    current_game_score?: string;
    category?: { name: string };
}

interface Court {
    id: string;
    name: string;
    surface_type: string;
    referee_token: string;
    referee_pin: string;
    matches: Match[];
}

interface Props {
    tournament: any;
    courts: Court[];
    unassignedMatches: Match[];
}

export default function CourtControlIndex({ tournament, courts, unassignedMatches }: Props) {
    const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
    const [selectedMatchId, setSelectedMatchId] = useState<string>('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [finishingMatch, setFinishingMatch] = useState<Match | null>(null);
    const [winnerTeamId, setWinnerTeamId] = useState<string>('');
    const [finalT1Score, setFinalT1Score] = useState<number>(6);
    const [finalT2Score, setFinalT2Score] = useState<number>(0);

    const handleCopyTokenUrl = (token: string) => {
        const url = `${window.location.origin}/referee/${token}`;
        navigator.clipboard.writeText(url);
        toast.success('Link wasit berhasil disalin ke clipboard!');
    };

    const handleOpenAssignModal = (courtId: string) => {
        setSelectedCourtId(courtId);
        setShowAssignModal(true);
    };

    const handleAssignMatchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourtId || !selectedMatchId) return;

        router.post(route('organizer.tournaments.court-control.assign', tournament.id), {
            court_id: selectedCourtId,
            match_id: selectedMatchId,
        }, {
            onSuccess: () => {
                setShowAssignModal(false);
                setSelectedMatchId('');
                toast.success('Pertandingan berhasil ditugaskan ke lapangan!');
            }
        });
    };

    const handleStartMatch = (matchId: string) => {
        router.post(route('organizer.tournaments.court-control.status', [tournament.id, matchId]), {
            status: 'in_progress',
        }, {
            onSuccess: () => toast.success('Pertandingan dimulai! Live timer aktif.')
        });
    };

    const handleOpenFinishModal = (match: Match) => {
        setFinishingMatch(match);
        setWinnerTeamId(match.team1_id || '');
        setFinalT1Score(match.team1_set1_score ?? 6);
        setFinalT2Score(match.team2_set1_score ?? 0);
    };

    const handleFinishMatchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!finishingMatch || !winnerTeamId) return;

        router.post(route('organizer.tournaments.court-control.status', [tournament.id, finishingMatch.id]), {
            status: 'completed',
            winner_team_id: winnerTeamId,
            team1_set1_score: finalT1Score,
            team2_set1_score: finalT2Score,
        }, {
            onSuccess: () => {
                setFinishingMatch(null);
                toast.success('Pertandingan selesai! Pemenang lolos ke babak selanjutnya.');
            }
        });
    };

    const handleCallPlayers = (matchId: string) => {
        router.post(route('organizer.tournaments.court-control.call', [tournament.id, matchId]), {}, {
            onSuccess: () => toast.success('Panggilan lapangan berhasil dikirim ke nomor WhatsApp pemain!'),
            onError: () => toast.error('Gagal mengirim panggilan via WhatsApp.'),
        });
    };

    return (
        <OrganizerLayout title={`Court Control Desk - ${tournament.name}`}>
            <Head title={`Court Control Desk - ${tournament.name}`} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                            <Activity className="w-4 h-4 animate-pulse" />
                            Live Desk Management
                        </div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <LayoutGrid className="w-7 h-7 text-emerald-400" />
                            Court Control Board
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Monitor status seluruh lapangan, panggil pemain, dan assign antrean match secara instan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('organizer.tournaments.check-in', tournament.id)}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 transition"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Meja Check-in
                        </Link>
                        <Link
                            href={route('organizer.tournaments.show', tournament.id)}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 transition"
                        >
                            Kembali ke Turnamen
                        </Link>
                    </div>
                </div>

                {/* Courts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courts.map((court) => {
                        const ongoingMatch = court.matches.find(m => m.status === 'in_progress');
                        const nextPendingMatch = court.matches.find(m => m.status === 'pending');
                        const isVacant = !ongoingMatch;

                        return (
                            <motion.div
                                key={court.id}
                                layout
                                className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                                    ongoingMatch 
                                        ? 'bg-slate-900/90 border-emerald-500/50 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30' 
                                        : 'bg-slate-900/50 border-slate-800 shadow-md'
                                }`}
                            >
                                {/* Court Header */}
                                <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                                            {court.name}
                                        </h3>
                                        <span className="text-[11px] text-slate-500 uppercase tracking-wider">
                                            {court.surface_type.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {ongoingMatch ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs animate-pulse">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                                ONGOING
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 font-semibold text-xs">
                                                VACANT
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Court Body: Current / Next Match */}
                                <div className="p-5 space-y-4 flex-1">
                                    {ongoingMatch ? (
                                        <div className="space-y-4">
                                            <div className="text-[11px] font-semibold text-emerald-400/90 flex items-center justify-between">
                                                <span>{ongoingMatch.category?.name} • Match #{ongoingMatch.match_number}</span>
                                                <span className="text-slate-400">{ongoingMatch.round_name}</span>
                                            </div>

                                            {/* Teams & Score Box */}
                                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-white truncate pr-2">
                                                        {ongoingMatch.team1?.name}
                                                    </span>
                                                    <span className="text-lg font-black text-emerald-400 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                        {ongoingMatch.team1_set1_score ?? 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                                                    <span className="text-sm font-bold text-white truncate pr-2">
                                                        {ongoingMatch.team2?.name}
                                                    </span>
                                                    <span className="text-lg font-black text-emerald-400 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                        {ongoingMatch.team2_set1_score ?? 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action buttons for ongoing */}
                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                <button
                                                    onClick={() => handleOpenFinishModal(ongoingMatch)}
                                                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Selesaikan Match
                                                </button>
                                                <a
                                                    href={`/referee/${court.referee_token}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Buka Skor Wasit
                                                </a>
                                            </div>
                                            <button
                                                onClick={() => handleCallPlayers(ongoingMatch.id)}
                                                className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                                            >
                                                <PhoneCall className="w-3.5 h-3.5" />
                                                Panggil Pemain via WhatsApp
                                            </button>
                                        </div>
                                    ) : nextPendingMatch ? (
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                                                <div className="text-[11px] text-amber-400 font-semibold">
                                                    Siap Bertanding Berikutnya:
                                                </div>
                                                <div className="text-sm font-bold text-slate-200">
                                                    {nextPendingMatch.team1?.name} <span className="text-slate-500 font-normal">vs</span> {nextPendingMatch.team2?.name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {nextPendingMatch.category?.name} • Match #{nextPendingMatch.match_number}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStartMatch(nextPendingMatch.id)}
                                                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                                                >
                                                    <Play className="w-3.5 h-3.5" />
                                                    Mulai Pertandingan Ini
                                                </button>
                                                <button
                                                    onClick={() => handleCallPlayers(nextPendingMatch.id)}
                                                    title="Panggil Pemain via WhatsApp"
                                                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                                                >
                                                    <PhoneCall className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Panggil</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center space-y-3">
                                            <p className="text-xs text-slate-500">
                                                Lapangan ini sedang kosong dan siap dipakai.
                                            </p>
                                            <button
                                                onClick={() => handleOpenAssignModal(court.id)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-emerald-500/20 transition"
                                            >
                                                <PlusCircle className="w-3.5 h-3.5" />
                                                Pilih Match dari Antrean
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Court Footer: Referee Quick Link */}
                                <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <QrCode className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="font-mono text-[11px]">{court.referee_token}</span>
                                    </div>
                                    <button
                                        onClick={() => handleCopyTokenUrl(court.referee_token)}
                                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Salin Link Wasit
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Match Queue Section */}
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-emerald-400" />
                                Antrean Pertandingan Belum Ada Lapangan ({unassignedMatches.length})
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Daftar pertandingan yang siap ditugaskan ke lapangan kosong.
                            </p>
                        </div>
                    </div>

                    {unassignedMatches.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                            Semua pertandingan telah ditugaskan ke lapangan atau sudah selesai.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {unassignedMatches.map((match) => (
                                <div 
                                    key={match.id}
                                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                                >
                                    <div className="truncate pr-2">
                                        <div className="text-[11px] text-emerald-400 font-semibold truncate">
                                            {match.category?.name} • #{match.match_number} ({match.round_name})
                                        </div>
                                        <div className="text-xs font-bold text-slate-200 mt-1 truncate">
                                            {match.team1?.name} <span className="text-slate-500 font-normal">vs</span> {match.team2?.name}
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handleCallPlayers(match.id)}
                                            title="Panggil Pemain via WhatsApp"
                                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
                                        >
                                            <PhoneCall className="w-3.5 h-3.5" />
                                        </button>
                                        <select
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                router.post(route('organizer.tournaments.court-control.assign', tournament.id), {
                                                    court_id: e.target.value,
                                                    match_id: match.id,
                                                }, {
                                                    onSuccess: () => toast.success('Match ditugaskan ke lapangan!')
                                                });
                                            }}
                                            defaultValue=""
                                            className="px-3 py-1.5 rounded-xl bg-slate-800 border-slate-700 text-xs font-semibold text-slate-200 focus:ring-emerald-500"
                                        >
                                            <option value="" disabled>Pilih Lapangan...</option>
                                            {courts.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Assign Match */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-emerald-400" />
                            Pilih Match untuk Lapangan
                        </h3>

                        <form onSubmit={handleAssignMatchSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Pilih Pertandingan Antrean:
                                </label>
                                <select
                                    value={selectedMatchId}
                                    onChange={(e) => setSelectedMatchId(e.target.value)}
                                    required
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="" disabled>-- Pilih Pertandingan --</option>
                                    {unassignedMatches.map(m => (
                                        <option key={m.id} value={m.id}>
                                            #{m.match_number} {m.team1?.name} vs {m.team2?.name} ({m.category?.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
                                >
                                    Tugaskan Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Selesaikan Match & Pilih Pemenang */}
            {finishingMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                Selesaikan Pertandingan
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Tentukan skor akhir set dan pilih tim pemenang untuk memperbarui bagan/klasemen.
                            </p>
                        </div>

                        <form onSubmit={handleFinishMatchSubmit} className="space-y-4">
                            {/* Score inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                                    <label className="block text-xs font-bold text-slate-300 truncate">
                                        {finishingMatch.team1?.name}
                                    </label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={finalT1Score}
                                        onChange={(e) => setFinalT1Score(parseInt(e.target.value) || 0)}
                                        className="w-full text-center text-xl font-black bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 py-1.5"
                                    />
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                                    <label className="block text-xs font-bold text-slate-300 truncate">
                                        {finishingMatch.team2?.name}
                                    </label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={finalT2Score}
                                        onChange={(e) => setFinalT2Score(parseInt(e.target.value) || 0)}
                                        className="w-full text-center text-xl font-black bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 py-1.5"
                                    />
                                </div>
                            </div>

                            {/* Winner selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Pemenang Resmi:
                                </label>
                                <select
                                    value={winnerTeamId}
                                    onChange={(e) => setWinnerTeamId(e.target.value)}
                                    required
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                                >
                                    <option value={finishingMatch.team1_id}>{finishingMatch.team1?.name}</option>
                                    <option value={finishingMatch.team2_id}>{finishingMatch.team2?.name}</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setFinishingMatch(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
                                >
                                    Konfirmasi Kemenangan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </OrganizerLayout>
    );
}
