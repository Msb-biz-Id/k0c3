import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    Calendar, 
    Clock, 
    ArrowLeft, 
    Sparkles, 
    RotateCcw, 
    Printer, 
    Layers, 
    Plus, 
    X, 
    Check, 
    Activity,
    AlertCircle,
    ChevronRight,
    Users
} from 'lucide-react';
import { toast } from 'sonner';

interface MatchItem {
    id: string;
    category_id: string;
    court_id?: string;
    round_name: string;
    stage: string;
    group_letter?: string;
    match_number: number;
    scheduled_time?: string;
    status: string;
    category: {
        id: string;
        name: string;
    };
    court?: {
        id: string;
        name: string;
    };
    team1?: {
        id: string;
        name: string;
    };
    team2?: {
        id: string;
        name: string;
    };
}

interface CourtItem {
    id: string;
    name: string;
    surface_type: string;
}

interface CategoryItem {
    id: string;
    name: string;
}

interface Props {
    tournament: {
        id: string;
        name: string;
        start_date: string;
        end_date: string;
    };
    courts: CourtItem[];
    categories: CategoryItem[];
    scheduledMatches: MatchItem[];
    unassignedMatches: MatchItem[];
}

export default function TournamentSchedule({
    tournament,
    courts,
    categories,
    scheduledMatches,
    unassignedMatches,
}: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [assignModalMatch, setAssignModalMatch] = useState<MatchItem | null>(null);

    // Auto schedule form
    const autoForm = useForm({
        start_date: tournament.start_date,
        start_time: '08:00',
        interval_minutes: 45,
        court_ids: courts.map(c => c.id),
    });

    // Single assignment form
    const [manualCourtId, setManualCourtId] = useState<string>(courts[0]?.id || '');
    const [manualDate, setManualDate] = useState<string>(tournament.start_date);
    const [manualTime, setManualTime] = useState<string>('08:00');

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignModalMatch) return;

        const scheduledTime = `${manualDate} ${manualTime}:00`;
        router.post(route('organizer.tournaments.schedule.assign', tournament.id), {
            match_id: assignModalMatch.id,
            court_id: manualCourtId,
            scheduled_time: scheduledTime,
        }, {
            onSuccess: () => {
                setAssignModalMatch(null);
                toast.success('Pertandingan berhasil dijadwalkan!');
            },
        });
    };

    const handleUnassign = (matchId: string) => {
        if (!confirm('Keluarkan pertandingan ini dari jadwal lapangan?')) return;
        router.post(route('organizer.tournaments.schedule.unassign', tournament.id), {
            match_id: matchId,
        }, {
            onSuccess: () => toast.success('Pertandingan dikeluarkan dari jadwal.'),
        });
    };

    const handleAutoSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        autoForm.post(route('organizer.tournaments.schedule.auto', tournament.id), {
            onSuccess: () => {
                setIsAutoModalOpen(false);
                toast.success('Jadwal otomatis berhasil digenerate!');
            },
        });
    };

    const handleResetSchedule = () => {
        if (!confirm('PERINGATAN: Seluruh jadwal pertandingan yang belum selesai akan di-reset (menjadi belum terjadwal). Lanjutkan?')) return;
        router.post(route('organizer.tournaments.schedule.reset', tournament.id), {}, {
            onSuccess: () => toast.success('Jadwal turnamen di-reset.'),
        });
    };

    const filteredUnassigned = unassignedMatches.filter(m => {
        if (selectedCategory === 'all') return true;
        return m.category_id === selectedCategory;
    });

    // Generate unique time slots from scheduled matches or 08:00 to 21:00
    const timeSlots = [
        '08:00', '08:45', '09:30', '10:15', '11:00', '11:45',
        '12:30', '13:15', '14:00', '14:45', '15:30', '16:15',
        '17:00', '17:45', '18:30', '19:15', '20:00', '20:45'
    ];

    const formatMatchTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    };

    return (
        <OrganizerLayout>
            <Head title={`Matriks Jadwal Pertandingan - ${tournament.name}`} />

            <div className="space-y-6 pb-20 print:p-0">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
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
                            <span className="text-lime-400 font-bold">Matriks Jadwal & Lapangan</span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
                            <Calendar className="w-6 h-6 text-lime-400" />
                            <span>Jadwal Waktu & Lapangan Pertandingan</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shadow"
                        >
                            <Printer className="w-4 h-4 text-sky-400" />
                            <span>Cetak Jadwal (PDF)</span>
                        </button>

                        <button
                            onClick={handleResetSchedule}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reset Jadwal</span>
                        </button>

                        <button
                            onClick={() => setIsAutoModalOpen(true)}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition shadow-lg shadow-lime-400/20 active:scale-95"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Jadwalkan Otomatis (Auto-Schedule)</span>
                        </button>
                    </div>
                </div>

                {/* Print Title Only */}
                <div className="hidden print:block mb-4">
                    <h1 className="text-xl font-bold text-black">{tournament.name} - Matriks Jadwal Pertandingan</h1>
                    <p className="text-xs text-gray-600">Tanggal: {tournament.start_date} s/d {tournament.end_date}</p>
                </div>

                {/* Main Content: Split Grid & Unassigned Drawer */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Time-Court Matrix Table (3 Cols) */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                                <Activity className="w-4 h-4 text-lime-400" />
                                <span>{courts.length} Lapangan Terdaftar</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-emerald-400 font-mono">{scheduledMatches.length} Terjadwal</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-amber-400 font-mono">{unassignedMatches.length} Menunggu Slot</span>
                            </div>
                        </div>

                        {courts.length === 0 ? (
                            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
                                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                                <div className="text-sm font-bold text-white">Belum Ada Lapangan Terdaftar</div>
                                <p className="text-xs">Silakan tambahkan lapangan turnamen terlebih dahulu di menu Lapangan & PIN Wasit.</p>
                                <Link
                                    href={route('organizer.tournaments.courts', tournament.id)}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs"
                                >
                                    <span>Kelola Lapangan</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-900/80">
                                            <th className="p-3.5 text-xs font-black uppercase text-slate-400 w-24 tracking-wider border-r border-slate-800">
                                                Waktu
                                            </th>
                                            {courts.map(court => (
                                                <th key={court.id} className="p-3.5 text-xs font-bold text-white border-r border-slate-800 min-w-[220px]">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-black text-lime-400">{court.name}</span>
                                                        <span className="text-[10px] text-slate-500 font-mono uppercase">{court.surface_type}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {timeSlots.map(time => (
                                            <tr key={time} className="hover:bg-slate-900/30 transition">
                                                <td className="p-3 text-xs font-mono font-bold text-slate-400 bg-slate-900/40 border-r border-slate-800">
                                                    <div className="flex items-center space-x-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{time}</span>
                                                    </div>
                                                </td>
                                                {courts.map(court => {
                                                    // Find match scheduled around this time on this court
                                                    const match = scheduledMatches.find(m => {
                                                        if (m.court_id !== court.id) return false;
                                                        const mt = formatMatchTime(m.scheduled_time);
                                                        return mt === time;
                                                    });

                                                    return (
                                                        <td key={court.id} className="p-2 border-r border-slate-800 align-top">
                                                            {match ? (
                                                                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-lime-400/50 transition shadow space-y-2 group">
                                                                    <div className="flex items-center justify-between text-[11px]">
                                                                        <span className="px-2 py-0.5 rounded font-bold bg-lime-400/10 text-lime-400 text-[10px]">
                                                                            {match.category.name}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400 font-semibold">
                                                                            {match.round_name} {match.group_letter ? `Grup ${match.group_letter}` : ''}
                                                                        </span>
                                                                    </div>

                                                                    <div className="text-xs space-y-1 font-semibold text-white">
                                                                        <div className="truncate text-slate-200">
                                                                            1. {match.team1?.name || 'TBD'}
                                                                        </div>
                                                                        <div className="truncate text-slate-200">
                                                                            2. {match.team2?.name || 'TBD'}
                                                                        </div>
                                                                    </div>

                                                                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                                                                        <span className={`px-1.5 py-0.5 rounded uppercase font-mono font-bold ${
                                                                            match.status === 'completed'
                                                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                                                : match.status === 'on_court'
                                                                                ? 'bg-amber-400/20 text-amber-300 animate-pulse'
                                                                                : 'bg-slate-800 text-slate-400'
                                                                        }`}>
                                                                            {match.status}
                                                                        </span>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleUnassign(match.id)}
                                                                            className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition text-[10px] font-bold inline-flex items-center space-x-1"
                                                                            title="Keluarkan dari jadwal"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                            <span>Lepas</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-14 rounded-xl border border-dashed border-slate-800/80 flex items-center justify-center text-slate-700 hover:border-slate-700 hover:bg-slate-900/20 transition text-[11px]">
                                                                    <span>Kosong</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Unassigned Matches Sidebar (1 Col) */}
                    <div className="lg:col-span-1 space-y-4 print:hidden">
                        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    <h3 className="font-black text-sm text-white">Belum Terjadwal</h3>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/10 text-amber-400">
                                    {filteredUnassigned.length}
                                </span>
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Filter Kategori
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                                >
                                    <option value="all">Semua Kategori ({unassignedMatches.length})</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Matches List */}
                            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                                {filteredUnassigned.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500 text-xs rounded-xl bg-slate-950/50 border border-slate-800/80">
                                        Semua pertandingan pada kategori ini sudah memiliki slot lapangan & waktu.
                                    </div>
                                ) : (
                                    filteredUnassigned.map(match => (
                                        <div
                                            key={match.id}
                                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-lime-400/40 transition space-y-2.5 shadow"
                                        >
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="font-bold text-lime-400 text-[10px]">
                                                    {match.category.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-semibold">
                                                    {match.round_name} {match.group_letter ? `(${match.group_letter})` : ''}
                                                </span>
                                            </div>

                                            <div className="text-xs font-semibold text-slate-200 space-y-1">
                                                <div className="truncate">1. {match.team1?.name || 'TBD'}</div>
                                                <div className="truncate">2. {match.team2?.name || 'TBD'}</div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAssignModalMatch(match);
                                                }}
                                                className="w-full inline-flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-lime-400/10 hover:bg-lime-400 hover:text-slate-950 text-lime-400 text-xs font-bold transition"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Pilih Slot Waktu</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal: Single Match Slot Assignment */}
                {assignModalMatch && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div className="space-y-0.5">
                                    <h3 className="text-base font-bold text-white">Tugaskan Slot Pertandingan</h3>
                                    <p className="text-xs text-slate-400">{assignModalMatch.category.name} • {assignModalMatch.round_name}</p>
                                </div>
                                <button
                                    onClick={() => setAssignModalMatch(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 space-y-1">
                                <div>1. {assignModalMatch.team1?.name || 'TBD'}</div>
                                <div className="text-slate-500 font-mono text-center">VS</div>
                                <div>2. {assignModalMatch.team2?.name || 'TBD'}</div>
                            </div>

                            <form onSubmit={handleAssign} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Pilih Lapangan</label>
                                    <select
                                        value={manualCourtId}
                                        onChange={e => setManualCourtId(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                                        required
                                    >
                                        {courts.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.surface_type})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Tanggal</label>
                                        <input
                                            type="date"
                                            value={manualDate}
                                            onChange={e => setManualDate(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Jam Mulai</label>
                                        <input
                                            type="time"
                                            value={manualTime}
                                            onChange={e => setManualTime(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setAssignModalMatch(null)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition"
                                    >
                                        Simpan Jadwal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Auto-Schedule Configuration */}
                {isAutoModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div className="flex items-center space-x-2">
                                    <Sparkles className="w-5 h-5 text-lime-400" />
                                    <h3 className="text-base font-bold text-white">Auto-Schedule Engine</h3>
                                </div>
                                <button
                                    onClick={() => setIsAutoModalOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                Fitur ini akan otomatis memplot seluruh pertandingan yang belum terjadwal ke dalam lapangan terpilih secara berurutan berdasarkan durasi estimasi per pertandingan.
                            </p>

                            <form onSubmit={handleAutoSchedule} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Tanggal Mulai</label>
                                        <input
                                            type="date"
                                            value={autoForm.data.start_date}
                                            onChange={e => autoForm.setData('start_date', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Jam Mulai</label>
                                        <input
                                            type="time"
                                            value={autoForm.data.start_time}
                                            onChange={e => autoForm.setData('start_time', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Interval / Estimasi Durasi per Match</label>
                                    <select
                                        value={autoForm.data.interval_minutes}
                                        onChange={e => autoForm.setData('interval_minutes', parseInt(e.target.value))}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                                    >
                                        <option value={30}>30 Menit (Race to 4 / Fast Padel)</option>
                                        <option value={45}>45 Menit (Race to 6 Golden Point - Standar)</option>
                                        <option value={60}>60 Menit (Best of 3 Sets / Final)</option>
                                        <option value={90}>90 Menit</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-300">Pilih Lapangan yang Digunakan</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {courts.map(court => (
                                            <label
                                                key={court.id}
                                                className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={autoForm.data.court_ids.includes(court.id)}
                                                    onChange={e => {
                                                        const current = autoForm.data.court_ids;
                                                        if (e.target.checked) {
                                                            autoForm.setData('court_ids', [...current, court.id]);
                                                        } else {
                                                            autoForm.setData('court_ids', current.filter(id => id !== court.id));
                                                        }
                                                    }}
                                                    className="rounded border-slate-700 text-lime-400 focus:ring-0"
                                                />
                                                <span className="text-xs font-bold text-white">{court.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAutoModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={autoForm.processing || autoForm.data.court_ids.length === 0}
                                        className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition disabled:opacity-50"
                                    >
                                        Jadwalkan Sekarang
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </OrganizerLayout>
    );
}
