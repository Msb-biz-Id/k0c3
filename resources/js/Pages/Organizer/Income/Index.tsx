import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    DollarSign, 
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Building2, 
    CreditCard, 
    AlertCircle, 
    X,
    TrendingUp,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface TournamentLedger {
    id: string;
    name: string;
    status: string;
    start_date?: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_holder: string;
    verified_teams_count: number;
    gross_income: number;
    platform_fee: number;
    withdrawn: number;
    pending_payout: number;
    net_available: number;
}

interface PayoutRequestItem {
    id: string;
    tournament: {
        name: string;
    };
    net_amount: number;
    bank_name: string;
    bank_account_number: string;
    bank_account_holder: string;
    status: 'pending' | 'approved' | 'transferred' | 'rejected';
    transfer_receipt_url?: string;
    admin_notes?: string;
    created_at: string;
}

interface Props {
    ledgers: TournamentLedger[];
    payoutHistory: PayoutRequestItem[];
    summary: {
        total_gross: number;
        total_platform_fee: number;
        total_withdrawn: number;
        total_pending: number;
        total_net_available: number;
    };
}

export default function IncomeIndex({ ledgers, payoutHistory, summary }: Props) {
    const [selectedTournament, setSelectedTournament] = useState<TournamentLedger | null>(null);

    const form = useForm({
        tournament_id: '',
        amount: 0,
        bank_name: '',
        bank_account_number: '',
        bank_account_holder: '',
    });

    const handleOpenPayout = (ledger: TournamentLedger) => {
        setSelectedTournament(ledger);
        form.setData({
            tournament_id: ledger.id,
            amount: ledger.net_available,
            bank_name: ledger.bank_name || 'BCA',
            bank_account_number: ledger.bank_account_number || '',
            bank_account_holder: ledger.bank_account_holder || '',
        });
    };

    const handleSubmitPayout = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('organizer.income.payout'), {
            onSuccess: () => {
                setSelectedTournament(null);
                toast.success('Permintaan penarikan dana berhasil diajukan!');
            },
        });
    };

    const getPayoutStatusBadge = (status: string) => {
        switch (status) {
            case 'transferred':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">DITRANSFER</span>;
            case 'approved':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">DISETUJUI</span>;
            case 'rejected':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">DITOLAK</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">MENUNGGU VERIFIKASI</span>;
        }
    };

    return (
        <OrganizerLayout>
            <Head title="Pendapatan & Pencairan Dana EO - PadelGigs" />

            <div className="space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
                            <TrendingUp className="w-6 h-6 text-lime-400" />
                            <span>Buku Besar Pendapatan & Penarikan Dana</span>
                        </h1>
                        <p className="text-xs text-slate-400">
                            Kelola akumulasi biaya registrasi peserta turnamen dan ajukan pencairan dana langsung ke rekening bank Anda.
                        </p>
                    </div>
                </div>

                {/* 4 Metric Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                            <span>Total Bruto Registrasi</span>
                            <DollarSign className="w-4 h-4 text-lime-400" />
                        </div>
                        <div className="text-2xl font-black text-white font-mono">
                            Rp {summary.total_gross.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-slate-500">Dari seluruh pendaftar berbayar</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                            <span>Biaya Platform (5%)</span>
                            <Building2 className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-400 font-mono">
                            Rp {summary.total_platform_fee.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-slate-500">Operasional server & payment gateway</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                            <span>Sudah Dicairkan</span>
                            <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="text-2xl font-black text-sky-400 font-mono">
                            Rp {summary.total_withdrawn.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-slate-500">Berhasil masuk ke rekening bank</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-lime-400/10 border border-lime-400/30 backdrop-blur-xl space-y-2 shadow-lg shadow-lime-400/5">
                        <div className="flex items-center justify-between text-lime-400 text-xs font-black uppercase">
                            <span>Saldo Siap Ditarik</span>
                            <ArrowUpRight className="w-4 h-4 text-lime-400" />
                        </div>
                        <div className="text-2xl font-black text-lime-400 font-mono">
                            Rp {summary.total_net_available.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-lime-300/80">Dana bersih tersedia untuk dicairkan</div>
                    </div>
                </div>

                {/* Per-Tournament Breakdown Table */}
                <div className="space-y-4">
                    <h2 className="text-base font-black text-white">Rincian Finansial per Turnamen</h2>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-4">Nama Turnamen</th>
                                        <th className="p-4">Tim Terverifikasi</th>
                                        <th className="p-4">Gross Registrasi</th>
                                        <th className="p-4">Potongan (5%)</th>
                                        <th className="p-4">Sudah Ditarik</th>
                                        <th className="p-4">Saldo Bersih Tersedia</th>
                                        <th className="p-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 font-medium">
                                    {ledgers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-slate-500">
                                                Belum ada turnamen yang Anda buat.
                                            </td>
                                        </tr>
                                    ) : (
                                        ledgers.map(l => (
                                            <tr key={l.id} className="hover:bg-slate-900/50 transition">
                                                <td className="p-4">
                                                    <div className="font-bold text-white text-sm">{l.name}</div>
                                                    <div className="text-[11px] text-slate-400 font-mono">{l.start_date || 'Belum dimulai'}</div>
                                                </td>

                                                <td className="p-4">
                                                    <span className="font-bold text-white">{l.verified_teams_count}</span>
                                                    <span className="text-slate-500 text-[11px]"> Tim</span>
                                                </td>

                                                <td className="p-4 font-mono font-bold text-slate-200">
                                                    Rp {l.gross_income.toLocaleString('id-ID')}
                                                </td>

                                                <td className="p-4 font-mono text-slate-400">
                                                    Rp {l.platform_fee.toLocaleString('id-ID')}
                                                </td>

                                                <td className="p-4 font-mono text-sky-400">
                                                    Rp {l.withdrawn.toLocaleString('id-ID')}
                                                </td>

                                                <td className="p-4 font-mono font-black text-lime-400">
                                                    Rp {l.net_available.toLocaleString('id-ID')}
                                                </td>

                                                <td className="p-4 text-right">
                                                    <button
                                                        type="button"
                                                        disabled={l.net_available < 50000}
                                                        onClick={() => handleOpenPayout(l)}
                                                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition shadow disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                        <span>Tarik Dana</span>
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

                {/* Riwayat Penarikan Dana */}
                <div className="space-y-4">
                    <h2 className="text-base font-black text-white">Riwayat Permintaan Penarikan Dana</h2>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-4">Tanggal Pengajuan</th>
                                        <th className="p-4">Turnamen</th>
                                        <th className="p-4">Nominal Diterima</th>
                                        <th className="p-4">Rekening Tujuan</th>
                                        <th className="p-4">Status Pencairan</th>
                                        <th className="p-4 text-right">Bukti Transfer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 font-medium">
                                    {payoutHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-slate-500">
                                                Belum ada riwayat penarikan dana.
                                            </td>
                                        </tr>
                                    ) : (
                                        payoutHistory.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-900/50 transition">
                                                <td className="p-4 font-mono text-slate-400 text-[11px]">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>

                                                <td className="p-4 font-bold text-white">
                                                    {item.tournament?.name || '-'}
                                                </td>

                                                <td className="p-4 font-mono font-black text-lime-400">
                                                    Rp {Number(item.net_amount).toLocaleString('id-ID')}
                                                </td>

                                                <td className="p-4">
                                                    <div className="font-bold text-white uppercase">{item.bank_name} - {item.bank_account_number}</div>
                                                    <div className="text-[11px] text-slate-400">a/n {item.bank_account_holder}</div>
                                                </td>

                                                <td className="p-4">
                                                    {getPayoutStatusBadge(item.status)}
                                                    {item.admin_notes && (
                                                        <div className="text-[10px] text-slate-400 italic mt-0.5">
                                                            {item.admin_notes}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="p-4 text-right">
                                                    {item.transfer_receipt_url ? (
                                                        <a
                                                            href={item.transfer_receipt_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 font-bold"
                                                        >
                                                            <span>Lihat Bukti</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-600 text-[11px] italic">Dalam proses</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal Tarik Dana */}
                {selectedTournament && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div>
                                    <h3 className="text-base font-bold text-white">Ajukan Penarikan Dana</h3>
                                    <p className="text-xs text-slate-400">{selectedTournament.name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTournament(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-4 rounded-xl bg-lime-400/10 border border-lime-400/20 text-xs text-lime-300 space-y-1">
                                <div className="font-bold">Maksimal Dana Tersedia:</div>
                                <div className="text-xl font-black font-mono text-lime-400">
                                    Rp {selectedTournament.net_available.toLocaleString('id-ID')}
                                </div>
                            </div>

                            <form onSubmit={handleSubmitPayout} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Nominal Penarikan (Rp)</label>
                                    <input
                                        type="number"
                                        min={50000}
                                        max={selectedTournament.net_available}
                                        value={form.data.amount}
                                        onChange={e => form.setData('amount', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-lime-400"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Nama Bank</label>
                                    <input
                                        type="text"
                                        value={form.data.bank_name}
                                        onChange={e => form.setData('bank_name', e.target.value)}
                                        placeholder="BCA, Mandiri, BNI, BRI, dll"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs uppercase"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Nomor Rekening</label>
                                    <input
                                        type="text"
                                        value={form.data.bank_account_number}
                                        onChange={e => form.setData('bank_account_number', e.target.value)}
                                        placeholder="1234567890"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Nama Pemilik Rekening</label>
                                    <input
                                        type="text"
                                        value={form.data.bank_account_holder}
                                        onChange={e => form.setData('bank_account_holder', e.target.value)}
                                        placeholder="Sesuai buku tabungan"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTournament(null)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing || form.data.amount <= 0 || form.data.amount > selectedTournament.net_available}
                                        className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition disabled:opacity-40"
                                    >
                                        Kirim Pengajuan
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
