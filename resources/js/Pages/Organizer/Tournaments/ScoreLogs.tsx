import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    Clock, 
    ArrowLeft, 
    FileText, 
    History, 
    Activity, 
    CheckCircle2, 
    RotateCcw,
    Trophy,
    Filter
} from 'lucide-react';

interface ScoreLogItem {
    id: string;
    match_id: string;
    court_name?: string;
    previous_score: string;
    new_score: string;
    action_type: 'point_update' | 'set_finish' | 'match_finish' | 'undo';
    notes?: string;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
    match: {
        id: string;
        round_name: string;
        group_letter?: string;
        category: {
            name: string;
        };
        team1?: {
            name: string;
        };
        team2?: {
            name: string;
        };
    };
}

interface Props {
    tournament: {
        id: string;
        name: string;
    };
    logs: {
        data: ScoreLogItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        action_type: string;
    };
}

export default function TournamentScoreLogs({ tournament, logs, filters }: Props) {
    const actionTypes = [
        { id: 'all', label: 'Semua Aksi' },
        { id: 'point_update', label: 'Update Poin' },
        { id: 'set_finish', label: 'Set Selesai' },
        { id: 'match_finish', label: 'Pertandingan Selesai' },
        { id: 'undo', label: 'Undo Skor' },
    ];

    const handleFilterChange = (actionType: string) => {
        router.get(
            route('organizer.tournaments.score-logs', tournament.id),
            { action_type: actionType },
            { preserveState: true }
        );
    };

    const getActionBadge = (type: string) => {
        switch (type) {
            case 'match_finish':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">MATCH FINISH</span>;
            case 'set_finish':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">SET FINISH</span>;
            case 'undo':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">UNDO POINT</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800">POINT UPDATE</span>;
        }
    };

    return (
        <OrganizerLayout>
            <Head title={`Audit Log Skor - ${tournament.name}`} />

            <div className="space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <Link href={route('organizer.tournaments.index')} className="hover:text-white transition">
                                Turnamen
                            </Link>
                            <span>/</span>
                            <Link href={route('organizer.tournaments.show', tournament.id)} className="hover:text-white transition">
                                {tournament.name}
                            </Link>
                            <span>/</span>
                            <span className="text-lime-400 font-bold">Audit Log Skor</span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
                            <History className="w-6 h-6 text-lime-400" />
                            <span>Audit Trail Riwayat Skor & Wasit Lapangan</span>
                        </h1>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filters.action_type}
                            onChange={e => handleFilterChange(e.target.value)}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                        >
                            {actionTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                                <tr>
                                    <th className="p-4">Waktu (WIB)</th>
                                    <th className="p-4">Pertandingan</th>
                                    <th className="p-4">Lapangan / Operator</th>
                                    <th className="p-4">Perubahan Skor</th>
                                    <th className="p-4">Aksi</th>
                                    <th className="p-4 text-right">Lembar Skor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-medium">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500">
                                            Belum ada riwayat update skor yang tercatat untuk turnamen ini.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-900/50 transition">
                                            {/* Timestamp */}
                                            <td className="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                                <div className="flex items-center space-x-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>{new Date(log.created_at).toLocaleTimeString('id-ID')}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    {new Date(log.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                            </td>

                                            {/* Match Info */}
                                            <td className="p-4 space-y-1">
                                                <div className="font-bold text-white flex items-center space-x-1.5">
                                                    <span className="text-lime-400 text-[11px]">{log.match.category.name}</span>
                                                    <span className="text-slate-600">•</span>
                                                    <span className="text-slate-300 text-[11px]">{log.match.round_name} {log.match.group_letter ? `(${log.match.group_letter})` : ''}</span>
                                                </div>
                                                <div className="text-slate-300 text-xs">
                                                    {log.match.team1?.name || 'TBD'} <span className="text-slate-500 text-[10px]">vs</span> {log.match.team2?.name || 'TBD'}
                                                </div>
                                            </td>

                                            {/* Court / Operator */}
                                            <td className="p-4 space-y-0.5">
                                                <div className="font-bold text-white text-xs">{log.court_name || 'Terminal Wasit'}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    {log.user?.name ? log.user.name : 'Wasit Lapangan (PIN)'}
                                                </div>
                                            </td>

                                            {/* Score Change Diff */}
                                            <td className="p-4 space-y-1">
                                                <div className="flex items-center space-x-2 font-mono text-xs">
                                                    <span className="line-through text-slate-500">{log.previous_score}</span>
                                                    <span className="text-slate-400">→</span>
                                                    <span className="text-lime-400 font-black bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
                                                        {log.new_score}
                                                    </span>
                                                </div>
                                                {log.notes && (
                                                    <div className="text-[10px] text-slate-500 italic">
                                                        {log.notes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Action Badge */}
                                            <td className="p-4 align-middle">
                                                {getActionBadge(log.action_type)}
                                            </td>

                                            {/* PDF Action */}
                                            <td className="p-4 text-right">
                                                <a
                                                    href={route('organizer.tournaments.matches.pdf', [tournament.id, log.match_id])}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-lime-400" />
                                                    <span>PDF</span>
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </OrganizerLayout>
    );
}
