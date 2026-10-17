import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Layers, 
    Users, 
    Award, 
    Plus, 
    Pencil, 
    Trash2, 
    Check, 
    X, 
    AlertTriangle,
    ArrowUp,
    ArrowDown,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MasterItem {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    sort_order: number;
    categories_count?: number;
    // Tier specific
    badge_color?: string;
    description?: string;
    // Division specific
    gender_restriction?: string;
    // Skill Level specific
    min_rating?: number;
    max_rating?: number;
}

interface Props {
    tiers: MasterItem[];
    divisions: MasterItem[];
    skillLevels: MasterItem[];
}

export default function MasterIndex({ tiers, divisions, skillLevels }: Props) {
    const [activeTab, setActiveTab] = useState<'tiers' | 'divisions' | 'skill_levels'>('tiers');
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<MasterItem | null>(null);

    // Form Handler
    const form = useForm({
        name: '',
        slug: '',
        badge_color: '#a3e635',
        description: '',
        gender_restriction: 'any',
        min_rating: '',
        max_rating: '',
    });

    const openCreateModal = () => {
        form.reset();
        setEditingItem(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (item: MasterItem) => {
        setEditingItem(item);
        form.setData({
            name: item.name,
            slug: item.slug,
            badge_color: item.badge_color || '#a3e635',
            description: item.description || '',
            gender_restriction: item.gender_restriction || 'any',
            min_rating: item.min_rating?.toString() || '',
            max_rating: item.max_rating?.toString() || '',
        });
        setIsCreateModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'tiers') {
            if (editingItem) {
                form.put(route('admin.master.tiers.update', editingItem.id), {
                    onSuccess: () => setIsCreateModalOpen(false),
                });
            } else {
                form.post(route('admin.master.tiers.store'), {
                    onSuccess: () => setIsCreateModalOpen(false),
                });
            }
        } else if (activeTab === 'divisions') {
            if (editingItem) {
                form.put(route('admin.master.divisions.update', editingItem.id), {
                    onSuccess: () => setIsCreateModalOpen(false),
                });
            } else {
                form.post(route('admin.master.divisions.store'), {
                    onSuccess: () => setIsCreateModalOpen(false),
                });
            }
        } else if (activeTab === 'skill_levels') {
            if (editingItem) {
                form.put(route('admin.master.skill-levels.update', editingItem.id), {
                    onSuccess: () => setIsCreateModalOpen(false),
                });
            } else {
                form.post(route('admin.master.skill-levels.store'), {
                    onSuccess: () => setIsCreateModalOpen(false),
                });
            }
        }
    };

    const handleToggleStatus = (id: string) => {
        if (activeTab === 'tiers') {
            router.patch(route('admin.master.tiers.toggle-status', id));
        } else if (activeTab === 'divisions') {
            router.patch(route('admin.master.divisions.toggle-status', id));
        } else if (activeTab === 'skill_levels') {
            router.patch(route('admin.master.skill-levels.toggle-status', id));
        }
    };

    const handleDelete = () => {
        if (!deletingItem) return;

        if (activeTab === 'tiers') {
            router.delete(route('admin.master.tiers.destroy', deletingItem.id), {
                onSuccess: () => setDeletingItem(null),
            });
        } else if (activeTab === 'divisions') {
            router.delete(route('admin.master.divisions.destroy', deletingItem.id), {
                onSuccess: () => setDeletingItem(null),
            });
        } else if (activeTab === 'skill_levels') {
            router.delete(route('admin.master.skill-levels.destroy', deletingItem.id), {
                onSuccess: () => setDeletingItem(null),
            });
        }
    };

    const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
        const currentList = activeTab === 'tiers' ? [...tiers] : activeTab === 'divisions' ? [...divisions] : [...skillLevels];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentList.length) return;

        const temp = currentList[index];
        currentList[index] = currentList[targetIndex];
        currentList[targetIndex] = temp;

        router.patch(route('admin.master.reorder'), {
            type: activeTab,
            ordered_ids: currentList.map(item => item.id),
        });
    };

    const currentItems = activeTab === 'tiers' ? tiers : activeTab === 'divisions' ? divisions : skillLevels;

    return (
        <AdminLayout>
            <Head title="Manajemen Master Data Dinamis" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
                        <Sparkles className="w-6 h-6 text-lime-400" />
                        <span>Pusat Kendali Master Data Dinamis</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Kelola data referensi turnamen secara dinamis tanpa perlu deploy ulang kode aplikasi.
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm transition shadow-lg shadow-lime-400/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>
                        {activeTab === 'tiers' && 'Tambah Tier Baru'}
                        {activeTab === 'divisions' && 'Tambah Divisi Baru'}
                        {activeTab === 'skill_levels' && 'Tambah Level Skill Baru'}
                    </span>
                </button>
            </div>

            {/* Segmented Pill Tabs */}
            <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-6 max-w-fit">
                <button
                    onClick={() => setActiveTab('tiers')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        activeTab === 'tiers'
                            ? 'bg-lime-400 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>Tier Turnamen ({tiers.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('divisions')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        activeTab === 'divisions'
                            ? 'bg-lime-400 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Divisi Kategori ({divisions.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('skill_levels')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        activeTab === 'skill_levels'
                            ? 'bg-lime-400 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Award className="w-4 h-4" />
                    <span>Level Skill Pemain ({skillLevels.length})</span>
                </button>
            </div>

            {/* Master Data Table */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/90 border-b border-slate-800">
                            <tr>
                                <th className="px-5 py-3.5 w-16 text-center">Urutan</th>
                                <th className="px-5 py-3.5">Nama & Identitas</th>
                                <th className="px-5 py-3.5">Atribut & Deskripsi</th>
                                <th className="px-5 py-3.5 text-center">Penggunaan</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {currentItems.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-800/30 transition">
                                    {/* Order Adjustment */}
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => handleMoveOrder(index, 'up')}
                                                className={`p-1 rounded hover:bg-slate-800 transition ${
                                                    index === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'
                                                }`}
                                                title="Naikkan Urutan"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="font-mono text-xs text-slate-500 font-bold w-4 text-center">
                                                {index + 1}
                                            </span>
                                            <button
                                                disabled={index === currentItems.length - 1}
                                                onClick={() => handleMoveOrder(index, 'down')}
                                                className={`p-1 rounded hover:bg-slate-800 transition ${
                                                    index === currentItems.length - 1 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'
                                                }`}
                                                title="Turunkan Urutan"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>

                                    {/* Name & Slug */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center space-x-3">
                                            {item.badge_color && (
                                                <span 
                                                    className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: item.badge_color }}
                                                />
                                            )}
                                            <div>
                                                <div className="font-bold text-white text-sm">{item.name}</div>
                                                <div className="font-mono text-xs text-slate-400 mt-0.5">slug: {item.slug}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Attributes & Description */}
                                    <td className="px-5 py-4">
                                        {activeTab === 'tiers' && (
                                            <div className="text-xs text-slate-400 max-w-sm line-clamp-2">
                                                {item.description || 'Tidak ada deskripsi'}
                                            </div>
                                        )}
                                        {activeTab === 'divisions' && (
                                            <span className="px-2 py-0.5 text-xs rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700">
                                                Gender: {item.gender_restriction || 'any'}
                                            </span>
                                        )}
                                        {activeTab === 'skill_levels' && (
                                            <div className="space-y-1">
                                                <div className="text-xs font-mono text-lime-400">
                                                    Rating: {item.min_rating || 0} - {item.max_rating || 5.0}
                                                </div>
                                                {item.description && (
                                                    <div className="text-[11px] text-slate-400 line-clamp-1">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>

                                    {/* Usage Impact Count */}
                                    <td className="px-5 py-4 text-center">
                                        <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800/80 text-slate-300 font-semibold border border-slate-700/60">
                                            {item.categories_count || 0} Kategori
                                        </span>
                                    </td>

                                    {/* Active Status Switch */}
                                    <td className="px-5 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleStatus(item.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                                item.is_active ? 'bg-lime-500' : 'bg-slate-700'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                                                    item.is_active ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4 text-right">
                                        <div className="inline-flex items-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingItem(item)}
                                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                                title="Hapus / Arsipkan"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah / Edit */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5"
                        >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                <h3 className="text-lg font-bold text-white">
                                    {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'tiers' ? 'Tier' : activeTab === 'divisions' ? 'Divisi' : 'Level Skill'}
                                </h3>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Nama {activeTab === 'tiers' ? 'Tier' : activeTab === 'divisions' ? 'Divisi' : 'Level'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        placeholder={activeTab === 'tiers' ? 'e.g. Major, Challenger' : activeTab === 'divisions' ? 'e.g. Veterans 40+' : 'e.g. Gold'}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-lime-400 text-sm font-medium"
                                    />
                                    {form.errors.name && <div className="text-rose-400 text-xs mt-1">{form.errors.name}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Slug (URL Friendly)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.slug}
                                        onChange={e => form.setData('slug', e.target.value)}
                                        placeholder="Otomatis jika dikosongkan"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-lime-400 text-sm font-mono"
                                    />
                                </div>

                                {activeTab === 'tiers' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                                Warna Badge Hex
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="color"
                                                    value={form.data.badge_color}
                                                    onChange={e => form.setData('badge_color', e.target.value)}
                                                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={form.data.badge_color}
                                                    onChange={e => form.setData('badge_color', e.target.value)}
                                                    className="w-36 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                                Deskripsi Singkat
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={form.data.description}
                                                onChange={e => form.setData('description', e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-lime-400"
                                            />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'divisions' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                            Batasan Gender
                                        </label>
                                        <select
                                            value={form.data.gender_restriction}
                                            onChange={e => form.setData('gender_restriction', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                                        >
                                            <option value="male">Pria Saja (Men)</option>
                                            <option value="female">Wanita Saja (Women)</option>
                                            <option value="mixed">Campuran (Mixed)</option>
                                            <option value="any">Bebas / Terbuka (Any)</option>
                                        </select>
                                    </div>
                                )}

                                {activeTab === 'skill_levels' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                                    Min Rating
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={form.data.min_rating}
                                                    onChange={e => form.setData('min_rating', e.target.value)}
                                                    placeholder="e.g. 2.0"
                                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-lime-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                                    Max Rating
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={form.data.max_rating}
                                                    onChange={e => form.setData('max_rating', e.target.value)}
                                                    placeholder="e.g. 2.9"
                                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-lime-400"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                                Panduan Deskripsi Kemampuan
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={form.data.description}
                                                onChange={e => form.setData('description', e.target.value)}
                                                placeholder="Penjelasan kemampuan teknis pemain di level ini..."
                                                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-lime-400"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition shadow-lg shadow-lime-400/20"
                                    >
                                        {editingItem ? 'Simpan Perubahan' : 'Tambah Data'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Hapus Aman (Safe Deletion with Usage Impact Warning) */}
            <AnimatePresence>
                {deletingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                                <AlertTriangle className="w-6 h-6" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white">Konfirmasi Pengarsipan (Hapus)</h3>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    Apakah Anda yakin ingin mengarsipkan <strong>"{deletingItem.name}"</strong>?
                                </p>
                            </div>

                            {deletingItem.categories_count && deletingItem.categories_count > 0 ? (
                                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                                    <strong>Proteksi Data Historis:</strong> Data ini sedang digunakan oleh{' '}
                                    <strong>{deletingItem.categories_count} kategori turnamen</strong>. Sistem akan menerapkan Soft Delete dan menyimpan nama snapshot agar turnamen terdahulu tidak rusak.
                                </div>
                            ) : null}

                            <div className="flex items-center justify-end space-x-3 pt-3">
                                <button
                                    onClick={() => setDeletingItem(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30"
                                >
                                    Ya, Arsipkan Data
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
