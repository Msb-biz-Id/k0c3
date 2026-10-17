import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    MessageSquare, 
    Send, 
    ShieldCheck, 
    Settings, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Smartphone,
    Terminal
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface WhatsAppConfig {
    id: number;
    base_url: string;
    api_token?: string;
    device_id?: string;
    webhook_key?: string;
    is_active: boolean;
    templates?: {
        registration?: string;
        court_call?: string;
        match_result?: string;
    };
}

interface WhatsAppLog {
    id: string;
    phone: string;
    message: string;
    event_type: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    created_at: string;
}

interface Props {
    config: WhatsAppConfig;
    recentLogs: WhatsAppLog[];
}

export default function WhatsAppIndex({ config, recentLogs }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';

    const { data, setData, put, processing } = useForm({
        base_url: config.base_url || 'https://api.sidobe.com',
        api_token: config.api_token || '',
        device_id: config.device_id || '',
        webhook_key: config.webhook_key || '',
        is_active: config.is_active,
        templates: config.templates || {},
    });

    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState(`Halo! Ini adalah pesan pengujian dari ${brandName} WhatsApp Gateway (sidobe.com).`);
    const [isSendingTest, setIsSendingTest] = useState(false);

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.whatsapp.update'), {
            onSuccess: () => toast.success('Konfigurasi WhatsApp Gateway berhasil disimpan!')
        });
    };

    const handleSendTestMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!testPhone) return;

        setIsSendingTest(true);
        router.post(route('admin.whatsapp.test'), {
            phone: testPhone,
            message: testMessage,
        }, {
            onSuccess: () => {
                setIsSendingTest(false);
                toast.success('Pesan pengujian berhasil dikirim!');
            },
            onError: () => setIsSendingTest(false),
        });
    };

    return (
        <AdminLayout title="WhatsApp Gateway (sidobe.com)">
            <Head title={`WhatsApp Gateway - ${brandName} Superadmin`} />
            <Toaster position="top-right" richColors />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                            <Smartphone className="w-4 h-4" />
                            Official Integration
                        </div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-emerald-400" />
                            WhatsApp Gateway sidobe.com
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Kelola kredensial API, notifikasi otomatis (panggilan lapangan, tiket, skor), dan sandbox simulator.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            config.is_active 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                            {config.is_active ? 'Gateway Aktif' : 'Gateway Nonaktif'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* CREDENTIALS & TEMPLATES CONFIG (2 Cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSaveConfig} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Settings className="w-4 h-4 text-emerald-400" />
                                Kredensial API sidobe.com
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Base URL API:</label>
                                    <input
                                        type="url"
                                        required
                                        value={data.base_url}
                                        onChange={(e) => setData('base_url', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">API Token Bearer:</label>
                                    <input
                                        type="password"
                                        placeholder="sidobe_token_xxxx"
                                        value={data.api_token}
                                        onChange={(e) => setData('api_token', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Device ID:</label>
                                    <input
                                        type="text"
                                        placeholder="dev_xxxx"
                                        value={data.device_id}
                                        onChange={(e) => setData('device_id', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                            </div>

                            {/* Template Message */}
                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Template Pesan Otomatis</h4>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Panggilan Lapangan (Court Call):</label>
                                    <textarea
                                        rows={2}
                                        value={data.templates?.court_call || ''}
                                        onChange={(e) => setData('templates', { ...data.templates, court_call: e.target.value })}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Pendaftaran & Pembayaran:</label>
                                    <textarea
                                        rows={2}
                                        value={data.templates?.registration || ''}
                                        onChange={(e) => setData('templates', { ...data.templates, registration: e.target.value })}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
                            >
                                Simpan Perubahan Kredensial
                            </button>
                        </form>
                    </div>

                    {/* SANDBOX TEST SIMULATOR (1 Col) */}
                    <div className="space-y-6">
                        <form onSubmit={handleSendTestMessage} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-emerald-400" />
                                Sandbox Test Simulator
                            </h3>
                            <p className="text-xs text-slate-400">
                                Uji coba langsung pengiriman notifikasi ke nomor WhatsApp Anda.
                            </p>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor WhatsApp Tujuan:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="08123456789"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Pesan Uji Coba:</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSendingTest || !testPhone}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {isSendingTest ? 'Mengirim...' : 'Kirim Pesan Uji Coba'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* DISPATCH AUDIT LOGS */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        Riwayat Transaksi Pesan Terakhir ({recentLogs.length})
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/60">
                                    <th className="py-3 px-4">Tujuan</th>
                                    <th className="py-3 px-4">Jenis Event</th>
                                    <th className="py-3 px-4">Isi Pesan</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {recentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500">
                                            Belum ada log pesan terkirim.
                                        </td>
                                    </tr>
                                ) : (
                                    recentLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-800/20">
                                            <td className="py-3 px-4 font-mono font-semibold text-white">{log.phone}</td>
                                            <td className="py-3 px-4 text-slate-400">{log.event_type}</td>
                                            <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{log.message}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    log.status === 'sent' || log.status === 'delivered' 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                                }`}>
                                                    {log.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                                                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
