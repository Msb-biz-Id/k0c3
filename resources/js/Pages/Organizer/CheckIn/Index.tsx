import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    Users, 
    CreditCard, 
    ArrowRight, 
    LayoutGrid,
    Phone,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface Player {
    id: string;
    player_order: number;
    name: string;
    phone?: string;
    jersey_size?: string;
}

interface Team {
    id: string;
    name: string;
    group_letter?: string;
    group_draw_seed?: number;
    payment_status: 'pending' | 'verified' | 'rejected';
    payment_amount: number;
    is_checked_in: boolean;
    checked_in_at?: string;
    players: Player[];
}

interface Category {
    id: string;
    name: string;
    tier_name?: string;
    division_name?: string;
    skill_level_name?: string;
    teams: Team[];
}

interface Props {
    tournament: any;
    categories: Category[];
}

export default function CheckInIndex({ tournament, categories }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

    // Aggregate counts
    const allTeams = categories.flatMap(c => c.teams.map(t => ({ ...t, categoryName: c.name, categoryId: c.id })));
    const totalTeams = allTeams.length;
    const checkedInCount = allTeams.filter(t => t.is_checked_in).length;
    const verifiedPaymentCount = allTeams.filter(t => t.payment_status === 'verified').length;

    const filteredTeams = allTeams.filter(team => {
        const matchesCategory = selectedCategoryId === 'all' || team.categoryId === selectedCategoryId;
        const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.players.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleToggleCheckIn = (teamId: string) => {
        router.post(route('organizer.tournaments.check-in.toggle', [tournament.id, teamId]), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Status check-in pemain berhasil diperbarui!')
        });
    };

    const handleVerifyPayment = (teamId: string, status: string) => {
        router.post(route('organizer.tournaments.check-in.payment', [tournament.id, teamId]), {
            payment_status: status,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Status verifikasi pembayaran diperbarui!')
        });
    };

    return (
        <OrganizerLayout title={`Meja Registrasi & Check-in - ${tournament.name}`}>
            <Head title={`Meja Registrasi & Check-in - ${tournament.name}`} />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                            <ShieldCheck className="w-4 h-4" />
                            Front Desk & Presensi Atlet
                        </div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <Users className="w-7 h-7 text-emerald-400" />
                            Meja Registrasi & Check-in
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Validasi kedatangan tim di venue, verifikasi bukti transfer, dan serah terima jersey turnamen.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('organizer.tournaments.court-control', tournament.id)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Court Control Desk
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Tim Terdaftar</span>
                        <div className="text-2xl font-black text-white">{totalTeams} Tim</div>
                    </div>
                    <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Pemain Hadir (Check-in)</span>
                        <div className="text-2xl font-black text-emerald-400">{checkedInCount} / {totalTeams}</div>
                    </div>
                    <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Pembayaran Terverifikasi</span>
                        <div className="text-2xl font-black text-blue-400">{verifiedPaymentCount} / {totalTeams}</div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Cari nama tim / atlet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                        <button
                            onClick={() => setSelectedCategoryId('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                selectedCategoryId === 'all'
                                    ? 'bg-emerald-500 text-slate-950 font-bold'
                                    : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                        >
                            Semua Kategori
                        </button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCategoryId(c.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                    selectedCategoryId === c.id
                                        ? 'bg-emerald-500 text-slate-950 font-bold'
                                        : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Teams Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/60">
                                    <th className="py-3.5 px-6">Nama Tim & Unggulan</th>
                                    <th className="py-3.5 px-4">Kategori</th>
                                    <th className="py-3.5 px-4">Anggota Atlet & Kontak</th>
                                    <th className="py-3.5 px-4 text-center">Status Bayar</th>
                                    <th className="py-3.5 px-6 text-center">Presensi Check-in</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {filteredTeams.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            Tidak ada tim yang cocok dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeams.map((team) => (
                                        <tr 
                                            key={team.id}
                                            className={`transition-colors hover:bg-slate-800/30 ${
                                                team.is_checked_in ? 'bg-emerald-500/5' : ''
                                            }`}
                                        >
                                            {/* Team Name */}
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-white text-sm">
                                                    {team.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {team.group_draw_seed && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                                                            Seed #{team.group_draw_seed}
                                                        </span>
                                                    )}
                                                    {team.group_letter && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                                                            Grup {team.group_letter}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-4 px-4 text-slate-300 font-medium">
                                                {team.categoryName}
                                            </td>

                                            {/* Players */}
                                            <td className="py-4 px-4 space-y-1">
                                                {team.players.map(p => (
                                                    <div key={p.id} className="text-slate-300 flex items-center gap-2">
                                                        <span className="text-slate-500 font-semibold">#{p.player_order}:</span>
                                                        <span className="font-semibold text-white">{p.name}</span>
                                                        {p.phone && (
                                                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                                                                <Phone className="w-2.5 h-2.5" />
                                                                {p.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </td>

                                            {/* Payment */}
                                            <td className="py-4 px-4 text-center">
                                                <select
                                                    value={team.payment_status}
                                                    onChange={(e) => handleVerifyPayment(team.id, e.target.value)}
                                                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                                                        team.payment_status === 'verified'
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                            : team.payment_status === 'rejected'
                                                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                    }`}
                                                >
                                                    <option value="verified">Verified (Lunas)</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </td>

                                            {/* Check-in Toggle */}
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleToggleCheckIn(team.id)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto ${
                                                        team.is_checked_in
                                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                                    }`}
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {team.is_checked_in ? 'Hadir (Check-in)' : 'Tandai Hadir'}
                                                </button>
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
