import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    Users, 
    Search, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertCircle, 
    Eye, 
    X, 
    Trash2, 
    DollarSign,
    Phone,
    ShieldAlert,
    ExternalLink,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface PlayerItem {
    id: string;
    player_order: number;
    name: string;
    phone?: string;
    email?: string;
    jersey_size?: string;
}

interface TeamItem {
    id: string;
    name: string;
    category_id: string;
    payment_status: 'pending' | 'verified' | 'rejected' | 'need_refund' | 'refunded' | 'cancelled' | 'expired';
    payment_amount: number;
    payment_receipt_url?: string;
    payment_verified_at?: string;
    notes?: string;
    created_at: string;
    category: {
        id: string;
        name: string;
        registration_fee: number;
    };
    team_players: PlayerItem[];
}

interface Props {
    tournament: {
        id: string;
        name: string;
    };
    categories: Array<{ id: string; name: string }>;
    teams: {
        data: TeamItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        status: string;
        category_id: string;
        search: string;
    };
    statusCounts: Record<string, number>;
}

export default function TournamentRegistrations({
    tournament,
    categories,
    teams,
    filters,
    statusCounts,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);
    const [rejectingTeam, setRejectingTeam] = useState<TeamItem | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const statusTabs = [
        { id: 'all', label: 'Semua', count: statusCounts.all, color: 'text-slate-300' },
        { id: 'pending', label: 'Menunggu Konfirmasi', count: statusCounts.pending, color: 'text-amber-400' },
        { id: 'verified', label: 'Paid / Terverifikasi', count: statusCounts.verified, color: 'text-emerald-400' },
        { id: 'need_refund', label: 'Perlu Refund', count: statusCounts.need_refund, color: 'text-purple-400' },
        { id: 'refunded', label: 'Refunded', count: statusCounts.refunded, color: 'text-sky-400' },
        { id: 'rejected', label: 'Ditolak', count: statusCounts.rejected, color: 'text-rose-400' },
        { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, color: 'text-slate-500' },
        { id: 'expired', label: 'Expired', count: statusCounts.expired, color: 'text-slate-600' },
    ];

    const applyFilter = (newFilters: Partial<typeof filters>) => {
        router.get(
            route('organizer.tournaments.registrations', tournament.id),
            { ...filters, ...newFilters },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const handleApprove = (teamId: string) => {
        router.post(
            route('organizer.tournaments.registrations.status', [tournament.id, teamId]),
            { status: 'verified' },
            { onSuccess: () => toast.success('Pendaftaran tim berhasil diverifikasi!') }
        );
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingTeam) return;

        router.post(
            route('organizer.tournaments.registrations.status', [tournament.id, rejectingTeam.id]),
            { status: 'rejected', notes: rejectReason },
            {
                onSuccess: () => {
                    setRejectingTeam(null);
                    setRejectReason('');
                    toast.success('Pendaftaran tim ditolak.');
                },
            }
        );
    };

    const handleQuickStatus = (teamId: string, status: string) => {
        router.post(
            route('organizer.tournaments.registrations.status', [tournament.id, teamId]),
            { status },
            { onSuccess: () => toast.success(`Status berhasil diubah menjadi ${status}.`) }
        );
    };

    const handleDelete = (teamId: string) => {
        if (!confirm('Hapus permanen pendaftaran tim ini?')) return;
        router.delete(
            route('organizer.tournaments.registrations.destroy', [tournament.id, teamId]),
            { onSuccess: () => toast.success('Pendaftaran berhasil dihapus.') }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PAID / VERIFIED</span>;
            case 'pending':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">MENUNGGU KONFIRMASI</span>;
            case 'rejected':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">DITOLAK</span>;
            case 'need_refund':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">PERLU REFUND</span>;
            case 'refunded':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">REFUNDED</span>;
            case 'cancelled':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">CANCELLED</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-500">{status.toUpperCase()}</span>;
        }
    };

    return (
        <OrganizerLayout>
            <Head title={`Pendaftaran Tim - ${tournament.name}`} />

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
                            <span className="text-lime-400 font-bold">Pendaftaran & Tim</span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
                            <Users className="w-6 h-6 text-lime-400" />
                            <span>Pusat Pendaftaran Tim & Verifikasi Kasir</span>
                        </h1>
                    </div>
                </div>

                {/* 8 Status Filter Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
                    {statusTabs.map(tab => {
                        const isActive = filters.status === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => applyFilter({ status: tab.id })}
                                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                    isActive
                                        ? 'bg-lime-400 text-slate-950 shadow-md font-black'
                                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${
                                    isActive ? 'bg-slate-950 text-lime-400' : 'bg-slate-950 text-slate-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Filters Row: Search & Category */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari tim, pemain, no. HP..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                        />
                    </form>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filters.category_id}
                            onChange={e => applyFilter({ category_id: e.target.value })}
                            className="px-3.5 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400 w-full sm:w-auto"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                                <tr>
                                    <th className="p-4">Tim & Pasangan Atlet</th>
                                    <th className="p-4">Kategori</th>
                                    <th className="p-4">Status & Pembayaran</th>
                                    <th className="p-4">Bukti Transfer</th>
                                    <th className="p-4">Waktu Daftar</th>
                                    <th className="p-4 text-right">Aksi Verifikasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {teams.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500">
                                            Tidak ada data pendaftaran yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                ) : (
                                    teams.data.map(team => {
                                        const captain = team.team_players?.find(p => p.player_order === 1) || team.team_players?.[0];
                                        const partner = team.team_players?.find(p => p.player_order === 2) || team.team_players?.[1];

                                        return (
                                            <tr key={team.id} className="hover:bg-slate-900/50 transition">
                                                {/* Team & Athletes */}
                                                <td className="p-4 space-y-2">
                                                    <div className="font-black text-sm text-white">{team.name}</div>
                                                    <div className="space-y-1 text-slate-300">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="px-1.5 py-0.2 rounded bg-lime-400/10 text-lime-400 font-mono text-[9px] font-bold">KAPTEN</span>
                                                            <span className="font-semibold">{captain?.name || '-'}</span>
                                                            {captain?.phone && (
                                                                <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                                                                    <Phone className="w-3 h-3 text-slate-500" />
                                                                    <span>{captain.phone}</span>
                                                                </span>
                                                            )}
                                                            {captain?.jersey_size && (
                                                                <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-300">Size {captain.jersey_size}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="px-1.5 py-0.2 rounded bg-sky-400/10 text-sky-400 font-mono text-[9px] font-bold">PARTNER</span>
                                                            <span className="font-semibold">{partner?.name || '-'}</span>
                                                            {partner?.phone && (
                                                                <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                                                                    <Phone className="w-3 h-3 text-slate-500" />
                                                                    <span>{partner.phone}</span>
                                                                </span>
                                                            )}
                                                            {partner?.jersey_size && (
                                                                <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-300">Size {partner.jersey_size}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {team.notes && (
                                                        <div className="text-[11px] text-amber-400/90 italic">
                                                            Catatan: {team.notes}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Category */}
                                                <td className="p-4 align-top">
                                                    <div className="font-bold text-white">{team.category.name}</div>
                                                    <div className="text-[11px] font-mono text-lime-400 mt-0.5">
                                                        Rp {Number(team.category.registration_fee).toLocaleString('id-ID')}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="p-4 align-top space-y-1">
                                                    <div>{getStatusBadge(team.payment_status)}</div>
                                                    {team.payment_verified_at && (
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                            Verif: {new Date(team.payment_verified_at).toLocaleDateString('id-ID')}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Receipt */}
                                                <td className="p-4 align-top">
                                                    {team.payment_receipt_url ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveReceiptUrl(team.payment_receipt_url!)}
                                                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold transition"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Lihat Bukti</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-600 text-[11px] italic">Tanpa Bukti</span>
                                                    )}
                                                </td>

                                                {/* Registration Time */}
                                                <td className="p-4 align-top text-slate-400 font-mono text-[11px]">
                                                    {new Date(team.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>

                                                {/* Action Buttons */}
                                                <td className="p-4 align-top text-right space-y-1.5">
                                                    {team.payment_status === 'pending' ? (
                                                        <div className="flex items-center justify-end space-x-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(team.id)}
                                                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition shadow"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>Terima</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRejectingTeam(team)}
                                                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                <span>Tolak</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {team.payment_status === 'verified' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleQuickStatus(team.id, 'need_refund')}
                                                                    className="text-[11px] text-purple-400 hover:underline"
                                                                >
                                                                    Tandai Refund
                                                                </button>
                                                            )}
                                                            {team.payment_status === 'need_refund' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleQuickStatus(team.id, 'refunded')}
                                                                    className="text-[11px] text-sky-400 hover:underline font-bold"
                                                                >
                                                                    Sudah Refund
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(team.id)}
                                                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                                                                title="Hapus Tim"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal: Preview Bukti Transfer */}
                {activeReceiptUrl && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                <h3 className="text-sm font-bold text-white">Bukti Pembayaran / Transfer</h3>
                                <button
                                    onClick={() => setActiveReceiptUrl(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto rounded-xl bg-slate-950 p-2 flex items-center justify-center">
                                <img
                                    src={activeReceiptUrl}
                                    alt="Bukti Transfer"
                                    className="max-h-[65vh] w-auto object-contain rounded-lg shadow"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal: Tolak Pendaftaran */}
                {rejectingTeam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-base font-bold text-white">Tolak Pendaftaran Tim</h3>
                                <button
                                    onClick={() => setRejectingTeam(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-300">
                                Anda akan menolak pendaftaran untuk tim <strong>{rejectingTeam.name}</strong>. Silakan masukkan alasan penolakan (misal: Bukti pembayaran tidak valid, kuota penuh, dll).
                            </p>

                            <form onSubmit={handleRejectSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Alasan Penolakan</label>
                                    <textarea
                                        rows={3}
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        placeholder="Tuliskan alasan penolakan..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-400"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setRejectingTeam(null)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black transition"
                                    >
                                        Konfirmasi Tolak
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
