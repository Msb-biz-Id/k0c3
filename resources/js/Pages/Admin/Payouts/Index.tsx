import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    CreditCard, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    DollarSign, 
    Upload, 
    Eye 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface PayoutRequest {
    id: string;
    gross_income: number;
    platform_fee: number;
    net_amount: number;
    bank_name: string;
    bank_account_number: string;
    bank_account_holder: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    transfer_receipt_url?: string;
    created_at: string;
    tournament?: { name: string };
    organizer?: { name: string; email: string };
}

interface Props {
    requests: {
        data: PayoutRequest[];
        links: any[];
        total: number;
    };
}

export default function PayoutsIndex({ requests }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
    const [status, setStatus] = useState<'approved' | 'rejected'>('approved');
    const [notes, setNotes] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdatePayout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayout) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('status', status);
        if (notes) formData.append('admin_notes', notes);
        if (receiptFile) formData.append('transfer_receipt', receiptFile);

        router.post(route('admin.payouts.update', selectedPayout.id), formData, {
            onSuccess: () => {
                setIsSubmitting(false);
                setSelectedPayout(null);
                setReceiptFile(null);
                setNotes('');
                toast.success('Status pencairan dana berhasil diperbarui.');
            },
            onError: () => setIsSubmitting(false),
        });
    };

    return (
        <AdminLayout title="Pencairan Dana EO">
            <Head title={`Pencairan Dana EO - ${brandName} Superadmin`} />
            <Toaster position="top-right" richColors />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                            Pencairan Dana EO (Payout Requests)
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Verifikasi pengajuan transfer bagi hasil turnamen dan upload bukti transfer bank.
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/60">
                                    <th className="py-3.5 px-6">Event Organizer & Turnamen</th>
                                    <th className="py-3.5 px-4">Rekening Tujuan</th>
                                    <th className="py-3.5 px-4 text-right">Nominal Bersih (Net)</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            Belum ada pengajuan pencairan dana.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.data.map((payout) => (
                                        <tr key={payout.id} className="hover:bg-slate-800/20">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-white text-sm">
                                                    {payout.organizer?.name}
                                                </div>
                                                <span className="text-[11px] text-emerald-400 block mt-0.5">
                                                    {payout.tournament?.name}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-300">
                                                <div className="font-bold text-white">{payout.bank_name}</div>
                                                <div className="font-mono text-slate-400 text-[11px]">{payout.bank_account_number}</div>
                                                <div className="text-[10px] text-slate-500">a.n. {payout.bank_account_holder}</div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="font-black font-mono text-sm text-emerald-400">
                                                    Rp {Number(payout.net_amount).toLocaleString('id-ID')}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    Gross: Rp {Number(payout.gross_income).toLocaleString('id-ID')}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    payout.status === 'approved'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                        : payout.status === 'rejected'
                                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                                }`}>
                                                    {payout.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayout(payout);
                                                        setStatus('approved');
                                                    }}
                                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                                                >
                                                    Proses
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

            {/* Approval Modal */}
            {selectedPayout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-400" />
                            Proses Pencairan Dana EO
                        </h3>

                        <form onSubmit={handleUpdatePayout} className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Penerima:</span>
                                    <span className="font-bold text-white">{selectedPayout.organizer?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Rekening:</span>
                                    <span className="font-mono text-emerald-400 font-bold">
                                        {selectedPayout.bank_name} - {selectedPayout.bank_account_number}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                                    <span className="text-white">Nominal Transfer:</span>
                                    <span className="text-emerald-400 font-mono">
                                        Rp {Number(selectedPayout.net_amount).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Keputusan Status:</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                >
                                    <option value="approved">Setujui & Tandai Sudah Ditransfer</option>
                                    <option value="rejected">Tolak Pengajuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Bukti Transfer (Opsional):</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Admin:</label>
                                <textarea
                                    rows={2}
                                    placeholder="Nomor referensi bank atau catatan khusus..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPayout(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                                >
                                    {isSubmitting ? 'Memproses...' : 'Simpan Keputusan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
