import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import CategoryLayout from './CategoryLayout';
import { 
    Users, 
    Plus, 
    Shuffle, 
    Star, 
    Phone, 
    CheckCircle2, 
    X,
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface TeamPlayerItem {
    id: string;
    name: string;
    phone?: string;
    player_order: number;
}

interface TeamItem {
    id: string;
    name: string;
    group_letter?: string;
    group_draw_seed?: number;
    payment_status: string;
    players: TeamPlayerItem[];
}

interface Props {
    tournament: any;
    category: any;
    teams: TeamItem[];
}

export default function CategoryTeams({ tournament, category, teams }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    // Form Tambah Tim Manual
    const form = useForm({
        name: '',
        player1_name: '',
        player1_phone: '',
        player2_name: '',
        player2_phone: '',
        group_draw_seed: '',
    });

    const handleAddTeam = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('organizer.categories.teams.manual', [tournament.id, category.id]), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
                toast.success('Tim berhasil ditambahkan!');
            },
        });
    };

    const handleDrawGroups = () => {
        if (teams.length < (category.group_count || 2)) {
            toast.error(`Minimal ${category.group_count || 2} tim dibutuhkan untuk melakukan undian grup.`);
            return;
        }

        setIsShuffling(true);

        // Simulasi 3D shuffle visual selama 800ms sebelum dispatch backend
        setTimeout(() => {
            router.post(route('organizer.categories.draw-groups', [tournament.id, category.id]), {}, {
                onFinish: () => setIsShuffling(false),
                onSuccess: () => toast.success('Undian grup seimbang berhasil dilaksanakan!'),
            });
        }, 800);
    };

    return (
        <CategoryLayout tournament={tournament} category={category} activeSubTab="teams">
            <Head title={`Tim & Undian Grup - ${category.name}`} />

            <div className="space-y-6">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-base font-bold text-white">Daftar Tim Terdaftar</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-lime-400/10 text-lime-400 border border-lime-400/20">
                                {teams.length} / {category.max_teams} Tim
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Kelola tim, atur seeding unggulan, dan jalankan undian grup seimbang (Fisher-Yates).
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Tim Manual</span>
                        </button>

                        <button
                            type="button"
                            disabled={isShuffling || teams.length < 2}
                            onClick={handleDrawGroups}
                            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition shadow-lg shadow-lime-400/20 active:scale-95 disabled:opacity-50"
                        >
                            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
                            <span>{isShuffling ? 'Mengundi Tim...' : 'Mulai Undian Grup'}</span>
                        </button>
                    </div>
                </div>

                {/* Teams Grid */}
                {teams.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-300">Belum ada tim yang terdaftar di kategori ini.</p>
                        <p>Klik "Tambah Tim Manual" atau buka pendaftaran turnamen agar atlet bisa mendaftar secara mandiri.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {teams.map(team => {
                                const captain = team.players?.find(p => p.player_order === 1);
                                const partner = team.players?.find(p => p.player_order === 2);

                                return (
                                    <motion.div
                                        key={team.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-black text-white text-base">{team.name}</div>
                                            
                                            <div className="flex items-center space-x-2">
                                                {team.group_draw_seed && (
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        <span>SEED {team.group_draw_seed}</span>
                                                    </span>
                                                )}
                                                {team.group_letter ? (
                                                    <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-lime-400 text-slate-950 shadow-sm">
                                                        GRUP {team.group_letter}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                                                        BELUM DIUNDI
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                                            <div className="flex items-center justify-between text-slate-300">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                                                    <span className="font-semibold">P1 (Kapten): {captain?.name || 'N/A'}</span>
                                                </div>
                                                {captain?.phone && (
                                                    <span className="text-[11px] font-mono text-slate-500">{captain.phone}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-slate-300">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                                    <span className="font-semibold">P2 (Partner): {partner?.name || 'N/A'}</span>
                                                </div>
                                                {partner?.phone && (
                                                    <span className="text-[11px] font-mono text-slate-500">{partner.phone}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                                            <span className="text-slate-400">Status Pembayaran:</span>
                                            <span className="font-bold text-emerald-400 flex items-center space-x-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Terverifikasi</span>
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modal Tambah Tim Manual */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5"
                        >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                                    <Users className="w-5 h-5 text-lime-400" />
                                    <span>Tambah Tim Manual</span>
                                </h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddTeam} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Nama Tim *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        placeholder="Contoh: Budi & Andi / The Smashers"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400 font-medium"
                                    />
                                    {form.errors.name && <div className="text-rose-400 text-xs mt-1">{form.errors.name}</div>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase">Pemain 1 (Kapten) *</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.data.player1_name}
                                            onChange={e => form.setData('player1_name', e.target.value)}
                                            placeholder="Nama Lengkap"
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase">No. WhatsApp P1</label>
                                        <input
                                            type="text"
                                            value={form.data.player1_phone}
                                            onChange={e => form.setData('player1_phone', e.target.value)}
                                            placeholder="08123456789"
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-lime-400"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase">Pemain 2 (Partner) *</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.data.player2_name}
                                            onChange={e => form.setData('player2_name', e.target.value)}
                                            placeholder="Nama Lengkap"
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase">No. WhatsApp P2</label>
                                        <input
                                            type="text"
                                            value={form.data.player2_phone}
                                            onChange={e => form.setData('player2_phone', e.target.value)}
                                            placeholder="08123456789"
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-lime-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Status Unggulan (Seeded)
                                    </label>
                                    <select
                                        value={form.data.group_draw_seed}
                                        onChange={e => form.setData('group_draw_seed', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                    >
                                        <option value="">Non-Unggulan (Acak Normal)</option>
                                        <option value="1">Unggulan 1 (Seed 1 - Masuk Grup A)</option>
                                        <option value="2">Unggulan 2 (Seed 2 - Masuk Grup B)</option>
                                        <option value="3">Unggulan 3 (Seed 3 - Masuk Grup C)</option>
                                        <option value="4">Unggulan 4 (Seed 4 - Masuk Grup D)</option>
                                    </select>
                                    <p className="text-[11px] text-slate-500">
                                        Tim unggulan akan dipisahkan secara otomatis agar tidak bertemu di grup yang sama saat undian.
                                    </p>
                                </div>

                                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition shadow-lg shadow-lime-400/20"
                                    >
                                        Simpan Tim
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CategoryLayout>
    );
}
