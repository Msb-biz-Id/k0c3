import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    Activity, 
    Plus, 
    Key, 
    Copy, 
    Check, 
    ExternalLink, 
    RotateCcw, 
    Edit2, 
    Trash2, 
    QrCode, 
    X, 
    Printer,
    Layers,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface CourtItem {
    id: string;
    tournament_id: string;
    name: string;
    surface_type: string;
    referee_token: string;
    referee_pin: string;
    is_active: boolean;
    active_matches_count?: number;
}

interface Props {
    tournament: {
        id: string;
        name: string;
    };
    courts: CourtItem[];
}

export default function TournamentCourts({ tournament, courts }: Props) {
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState<CourtItem | null>(null);
    const [qrCourt, setQrCourt] = useState<CourtItem | null>(null);

    // Add Court Form
    const addForm = useForm({
        name: '',
        surface_type: 'panoramic_turf',
        referee_pin: '1234',
    });

    // Edit Court Form
    const editForm = useForm({
        name: '',
        surface_type: 'panoramic_turf',
        referee_pin: '',
        is_active: true,
    });

    const handleCopyToken = (token: string) => {
        const url = `${window.location.origin}/referee/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedToken(token);
        toast.success('Link wasit berhasil disalin ke clipboard!');
        setTimeout(() => setCopiedToken(null), 3000);
    };

    const handleAddCourt = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('organizer.tournaments.courts.store', tournament.id), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
                toast.success('Lapangan baru berhasil ditambahkan!');
            },
        });
    };

    const handleOpenEdit = (court: CourtItem) => {
        setEditingCourt(court);
        editForm.setData({
            name: court.name,
            surface_type: court.surface_type,
            referee_pin: court.referee_pin,
            is_active: court.is_active,
        });
    };

    const handleUpdateCourt = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCourt) return;
        editForm.put(route('organizer.tournaments.courts.update', [tournament.id, editingCourt.id]), {
            onSuccess: () => {
                setEditingCourt(null);
                toast.success('Data lapangan diperbarui!');
            },
        });
    };

    const handleRegenerateToken = (courtId: string) => {
        if (!confirm('Token dan PIN baru akan dibuat. Link wasit lama tidak akan bisa diakses lagi. Lanjutkan?')) return;
        router.post(route('organizer.tournaments.courts.regenerate', [tournament.id, courtId]), {}, {
            onSuccess: () => toast.success('Token dan PIN baru berhasil digenerate!'),
        });
    };

    const handleDeleteCourt = (courtId: string) => {
        if (!confirm('Yakin ingin menghapus lapangan ini?')) return;
        router.delete(route('organizer.tournaments.courts.destroy', [tournament.id, courtId]), {
            onSuccess: () => toast.success('Lapangan berhasil dihapus.'),
        });
    };

    return (
        <OrganizerLayout>
            <Head title={`Master Lapangan & Wasit - ${tournament.name}`} />

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
                            <span className="text-lime-400 font-bold">Master Lapangan & PIN Wasit</span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
                            <Activity className="w-6 h-6 text-lime-400" />
                            <span>Master Lapangan & Akses Wasit Digital</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition shadow-lg shadow-lime-400/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Lapangan Baru</span>
                    </button>
                </div>

                {/* Info Alert */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-3 backdrop-blur-xl">
                    <ShieldCheck className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-white">Akses Wasit Berbasis Token Unik:</strong> Setiap lapangan memiliki URL rahasia dan PIN numerik 4 digit. Wasit tidak perlu registrasi akun admin. Cukup buka link di smartphone wasit atau scan QR code yang tertempel pada tiang wasit.
                    </div>
                </div>

                {/* Courts Grid */}
                {courts.length === 0 ? (
                    <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
                        <Activity className="w-10 h-10 text-slate-600 mx-auto" />
                        <div className="text-base font-bold text-white">Belum Ada Lapangan</div>
                        <p className="text-xs">Klik tombol "Tambah Lapangan Baru" untuk mendaftarkan lapangan pertandingan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {courts.map(court => {
                            const refereeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/referee/${court.referee_token}`;

                            return (
                                <div
                                    key={court.id}
                                    className={`p-5 rounded-2xl border transition space-y-4 shadow-xl ${
                                        court.is_active
                                            ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                                            : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                                    }`}
                                >
                                    {/* Court Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-black text-white text-base">{court.name}</h3>
                                                {court.active_matches_count && court.active_matches_count > 0 ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 animate-pulse">
                                                        LIVE MATCH
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                                                        STANDBY
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                                                {court.surface_type.replace('_', ' ')}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(court)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                                title="Edit Lapangan"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCourt(court.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                                title="Hapus Lapangan"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Secret Box */}
                                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Token Akses:</span>
                                            <span className="font-mono font-bold text-lime-400 text-xs truncate max-w-[170px]" title={court.referee_token}>
                                                {court.referee_token.slice(0, 16)}...
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">PIN Masuk Wasit:</span>
                                            <span className="font-mono font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700 tracking-widest text-sm">
                                                {court.referee_pin}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2 pt-1">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleCopyToken(court.referee_token)}
                                                className="inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                                            >
                                                {copiedToken === court.referee_token ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-lime-400" />
                                                        <span className="text-lime-400">Disalin!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Salin Link</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setQrCourt(court)}
                                                className="inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                                            >
                                                <QrCode className="w-3.5 h-3.5 text-sky-400" />
                                                <span>Lembar QR</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <a
                                                href={`/referee/${court.referee_token}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 font-semibold transition"
                                            >
                                                <span>Buka Terminal Wasit</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>

                                            <button
                                                type="button"
                                                onClick={() => handleRegenerateToken(court.id)}
                                                className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-amber-400 transition"
                                                title="Reset Token & PIN"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                <span>Reset PIN</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modal: Tambah Lapangan */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-base font-bold text-white">Tambah Lapangan Baru</h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleAddCourt} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Nama Lapangan</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Lapangan 1 (Center Court)"
                                        value={addForm.data.name}
                                        onChange={e => addForm.setData('name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Tipe Karpet / Rumput</label>
                                    <select
                                        value={addForm.data.surface_type}
                                        onChange={e => addForm.setData('surface_type', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                                    >
                                        <option value="panoramic_turf">Panoramic Pro Turf (Texturized)</option>
                                        <option value="monofilament">Monofilament Turf (FIP Standard)</option>
                                        <option value="fibrillated">Fibrillated Carpet</option>
                                        <option value="outdoor_sand">Outdoor Sand-Dressed</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">PIN Akses Wasit (4-6 Digit)</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="1234"
                                        value={addForm.data.referee_pin}
                                        onChange={e => addForm.setData('referee_pin', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-lime-400"
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addForm.processing}
                                        className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition"
                                    >
                                        Simpan Lapangan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Edit Lapangan */}
                {editingCourt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-base font-bold text-white">Edit Lapangan</h3>
                                <button
                                    onClick={() => setEditingCourt(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateCourt} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Nama Lapangan</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={e => editForm.setData('name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Tipe Karpet</label>
                                    <select
                                        value={editForm.data.surface_type}
                                        onChange={e => editForm.setData('surface_type', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                                    >
                                        <option value="panoramic_turf">Panoramic Pro Turf</option>
                                        <option value="monofilament">Monofilament Turf</option>
                                        <option value="fibrillated">Fibrillated Carpet</option>
                                        <option value="outdoor_sand">Outdoor Sand-Dressed</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">PIN Akses Wasit</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={editForm.data.referee_pin}
                                        onChange={e => editForm.setData('referee_pin', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono tracking-widest"
                                        required
                                    />
                                </div>

                                <label className="flex items-center space-x-2.5 cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        checked={editForm.data.is_active}
                                        onChange={e => editForm.setData('is_active', e.target.checked)}
                                        className="rounded border-slate-700 text-lime-400 focus:ring-0"
                                    />
                                    <span className="text-xs font-bold text-white">Lapangan Berstatus Aktif</span>
                                </label>

                                <div className="flex items-center justify-end space-x-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCourt(null)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition"
                                    >
                                        Perbarui Lapangan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Lembar QR Code Wasit */}
                {qrCourt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-white text-slate-950 p-6 space-y-4 shadow-2xl text-center">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Lembar Wasit Lapangan</span>
                                <button
                                    onClick={() => setQrCourt(null)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-black"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-extrabold text-lime-600 uppercase tracking-wider">{tournament.name}</div>
                                <h2 className="text-2xl font-black">{qrCourt.name}</h2>
                                <p className="text-xs text-gray-500">Scan QR untuk membuka Terminal Wasit Lapangan</p>
                            </div>

                            {/* QR Image preview */}
                            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center space-y-2">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                        `${window.location.origin}/referee/${qrCourt.referee_token}`
                                    )}`}
                                    alt="QR Code Wasit"
                                    className="w-48 h-48 rounded-xl shadow"
                                />
                                <div className="font-mono text-xs text-gray-500 pt-1">PIN: <strong className="text-black text-sm">{qrCourt.referee_pin}</strong></div>
                            </div>

                            <div className="flex items-center justify-center space-x-2 pt-2">
                                <button
                                    onClick={() => window.print()}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak Lembar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </OrganizerLayout>
    );
}
