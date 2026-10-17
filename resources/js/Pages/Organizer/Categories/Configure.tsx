import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import CategoryLayout from './CategoryLayout';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    tournament: any;
    category: any;
}

export default function CategoryConfigure({ tournament, category }: Props) {
    const form = useForm({
        max_teams: category.max_teams || 12,
        registration_fee: category.registration_fee || 0,
        format: category.format || 'group_knockout',
        group_count: category.group_count || 2,
        advancing_per_group: category.advancing_per_group || 2,
        has_wildcard: category.has_wildcard || false,
        has_third_place: category.has_third_place ?? true,
        knockout_method: category.knockout_method || 'cross_group',
        match_rules: category.match_rules || {
            group_race_to: 4,
            knockout_race_to: 6,
            deuce_rule: 'golden_point',
            has_tie_break: true,
            has_super_tie_break: true,
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('organizer.categories.configure.update', [tournament.id, category.id]), {
            onSuccess: () => toast.success('Aturan babak kategori berhasil disimpan!'),
        });
    };

    return (
        <CategoryLayout tournament={tournament} category={category} activeSubTab="configure">
            <Head title={`Konfigurasi - ${category.name}`} />

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl space-y-6">
                    <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800">
                        <Settings className="w-5 h-5 text-lime-400" />
                        <div>
                            <h2 className="text-base font-bold text-white">Struktur & Format Kategori</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Tentukan bagaimana tim bertanding dari fase grup hingga ke babak final.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Format Pertandingan
                            </label>
                            <select
                                value={form.data.format}
                                onChange={e => form.setData('format', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                            >
                                <option value="group_knockout">Fase Grup + Knockout (Sistem Gugur)</option>
                                <option value="knockout_only">Knockout Langsung (Bagan Gugur)</option>
                                <option value="round_robin">Round Robin Penuh (Hanya Grup)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Kuota Maksimal Tim
                            </label>
                            <input
                                type="number"
                                min={2}
                                max={64}
                                value={form.data.max_teams}
                                onChange={e => form.setData('max_teams', parseInt(e.target.value) || 2)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-lime-400"
                            />
                        </div>

                        {form.data.format === 'group_knockout' && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Jumlah Grup
                                    </label>
                                    <select
                                        value={form.data.group_count}
                                        onChange={e => form.setData('group_count', parseInt(e.target.value) || 2)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                                    >
                                        <option value={2}>2 Grup (Grup A & B)</option>
                                        <option value={4}>4 Grup (Grup A, B, C, D)</option>
                                        <option value={8}>8 Grup (Grup A s/d H)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Tim Lolos per Grup
                                    </label>
                                    <select
                                        value={form.data.advancing_per_group}
                                        onChange={e => form.setData('advancing_per_group', parseInt(e.target.value) || 2)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                                    >
                                        <option value={1}>Hanya Juara Grup (Top 1)</option>
                                        <option value={2}>Juara & Runner-up (Top 2)</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Biaya Registrasi per Tim (Rp)
                            </label>
                            <input
                                type="number"
                                min={0}
                                step={10000}
                                value={form.data.registration_fee}
                                onChange={e => form.setData('registration_fee', parseFloat(e.target.value) || 0)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-lime-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Metode Bagan Knockout
                            </label>
                            <select
                                value={form.data.knockout_method}
                                onChange={e => form.setData('knockout_method', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                            >
                                <option value="cross_group">Silang Grup (Juara A vs Runner-up B)</option>
                                <option value="seeded_draw">Undian Terbuka Unggulan (Seeded Draw)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="flex items-center space-x-2.5">
                            <input
                                type="checkbox"
                                id="has_third_place"
                                checked={form.data.has_third_place}
                                onChange={e => form.setData('has_third_place', e.target.checked)}
                                className="rounded bg-slate-950 border-slate-800 text-lime-400 focus:ring-lime-400 w-4 h-4"
                            />
                            <label htmlFor="has_third_place" className="text-xs text-slate-300 font-semibold cursor-pointer">
                                Perebutan Juara 3 (Bronze Match)
                            </label>
                        </div>

                        <div className="flex items-center space-x-2.5">
                            <input
                                type="checkbox"
                                id="has_wildcard"
                                checked={form.data.has_wildcard}
                                onChange={e => form.setData('has_wildcard', e.target.checked)}
                                className="rounded bg-slate-950 border-slate-800 text-lime-400 focus:ring-lime-400 w-4 h-4"
                            />
                            <label htmlFor="has_wildcard" className="text-xs text-slate-300 font-semibold cursor-pointer">
                                Wildcard / Best Loser Slot
                            </label>
                        </div>
                    </div>
                </div>

                {/* Aturan Game & Deuce (Padel Match Rules) */}
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-lime-400">
                        Aturan Game & Deuce Resmi
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Race To Game (Fase Grup)
                            </label>
                            <select
                                value={form.data.match_rules?.group_race_to || 4}
                                onChange={e => form.setData('match_rules', { ...form.data.match_rules, group_race_to: parseInt(e.target.value) })}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                            >
                                <option value={3}>Race to 3 Games</option>
                                <option value={4}>Race to 4 Games (Standar Mini)</option>
                                <option value={6}>Race to 6 Games (Standar Pro-Set)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Aturan Deuce (40-40)
                            </label>
                            <select
                                value={form.data.match_rules?.deuce_rule || 'golden_point'}
                                onChange={e => form.setData('match_rules', { ...form.data.match_rules, deuce_rule: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                            >
                                <option value="golden_point">Golden Point (Poin Penentu Langsung / No-Ad)</option>
                                <option value="advantage">Advantage Tradisional (Selisih 2 Poin)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition shadow-lg shadow-lime-400/20 active:scale-95 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>{form.processing ? 'Menyimpan...' : 'Simpan Konfigurasi Aturan'}</span>
                    </button>
                </div>
            </form>
        </CategoryLayout>
    );
}
