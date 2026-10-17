import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import CategoryLayout from './CategoryLayout';
import { 
    BookOpen, 
    Save, 
    FileText, 
    ShieldCheck, 
    Clock, 
    Zap, 
    CheckCircle2, 
    AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    tournament: any;
    category: any;
}

export default function CategoryRules({ tournament, category }: Props) {
    const rules = category.match_rules || {};

    const form = useForm({
        preset: rules.preset || 'fip_official',
        rulebook_text: rules.rulebook_text || 'Pertandingan mengikuti regulasi Federasi Padel Internasional (FIP) dan Perkumpulan Besar Padel Indonesia (PBPI). Keputusan wasit lapangan bersifat mutlak.',
        rulebook_pdf_url: rules.rulebook_pdf_url || '',
        warmup_duration_minutes: rules.warmup_duration_minutes ?? 5,
        walkover_grace_minutes: rules.walkover_grace_minutes ?? 15,
        super_tiebreak_points: rules.super_tiebreak_points ?? 10,
        golden_point_enabled: rules.golden_point_enabled ?? true,
    });

    const handleApplyPreset = (presetKey: string) => {
        if (presetKey === 'fip_official') {
            form.setData({
                ...form.data,
                preset: 'fip_official',
                warmup_duration_minutes: 5,
                walkover_grace_minutes: 15,
                super_tiebreak_points: 10,
                golden_point_enabled: true,
                rulebook_text: 'Menggunakan regulasi standar FIP: Best of 3 sets. Jika skor set 1-1, set ke-3 dimainkan sebagai Super Tie Break 10 poin. Setiap game menggunakan Golden Point (tanpa deuce advantage).',
            });
            toast.info('Preset Standar FIP Padel diterapkan.');
        } else if (presetKey === 'fast4_pro') {
            form.setData({
                ...form.data,
                preset: 'fast4_pro',
                warmup_duration_minutes: 3,
                walkover_grace_minutes: 10,
                super_tiebreak_points: 7,
                golden_point_enabled: true,
                rulebook_text: 'Format Fast4: Race to 4 games. Tiebreak pada skor 3-3 (first to 5 points). Golden point aktif pada setiap skor 40-40.',
            });
            toast.info('Preset Fast4 Pro diterapkan.');
        } else if (presetKey === 'fun_padel') {
            form.setData({
                ...form.data,
                preset: 'fun_padel',
                warmup_duration_minutes: 5,
                walkover_grace_minutes: 15,
                super_tiebreak_points: 7,
                golden_point_enabled: true,
                rulebook_text: 'Format Fun Padel / Komunitas: 1 set reguler race to 6 atau batas waktu 30 menit per pertandingan. Golden point pada deuce.',
            });
            toast.info('Preset Fun Padel diterapkan.');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('organizer.categories.rules.update', [tournament.id, category.id]), {
            onSuccess: () => toast.success('Regulasi rulebook kategori berhasil disimpan!'),
        });
    };

    return (
        <CategoryLayout tournament={tournament} category={category} activeSubTab="rules">
            <Head title={`Rulebook & Regulasi - ${category.name}`} />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* Preset Selector */}
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl space-y-4">
                    <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                        <Zap className="w-5 h-5 text-lime-400" />
                        <div>
                            <h2 className="text-base font-bold text-white">Preset Regulasi Cepat</h2>
                            <p className="text-xs text-slate-400">Pilih template standar aturan FIP atau modifikasi sesuai format turnamen Anda.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => handleApplyPreset('fip_official')}
                            className={`p-4 rounded-xl border text-left transition space-y-1.5 ${
                                form.data.preset === 'fip_official'
                                    ? 'bg-lime-400/10 border-lime-400/40 text-white'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <div className="text-xs font-black text-lime-400 uppercase">FIP Standard Pro</div>
                            <div className="text-xs font-medium">Race to 6, Golden Point, Super Tiebreak 10 Poin.</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleApplyPreset('fast4_pro')}
                            className={`p-4 rounded-xl border text-left transition space-y-1.5 ${
                                form.data.preset === 'fast4_pro'
                                    ? 'bg-sky-400/10 border-sky-400/40 text-white'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <div className="text-xs font-black text-sky-400 uppercase">Fast4 Padel</div>
                            <div className="text-xs font-medium">Race to 4 games, tiebreak di 3-3, durasi cepat.</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleApplyPreset('fun_padel')}
                            className={`p-4 rounded-xl border text-left transition space-y-1.5 ${
                                form.data.preset === 'fun_padel'
                                    ? 'bg-purple-400/10 border-purple-400/40 text-white'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <div className="text-xs font-black text-purple-400 uppercase">Fun / Community</div>
                            <div className="text-xs font-medium">1 Set Reguler, Golden Point, waktu santai.</div>
                        </button>
                    </div>
                </div>

                {/* Match Parameters */}
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl space-y-5">
                    <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                        <Clock className="w-5 h-5 text-sky-400" />
                        <div>
                            <h2 className="text-base font-bold text-white">Parameter Waktu & Point Wasit</h2>
                            <p className="text-xs text-slate-400">Aturan operasional wasit lapangan saat memimpin pertandingan kategori ini.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300">
                                Durasi Pemanasan (Menit)
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={15}
                                value={form.data.warmup_duration_minutes}
                                onChange={e => form.setData('warmup_duration_minutes', parseInt(e.target.value) || 0)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-lime-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300">
                                Toleransi Walkover (Menit)
                            </label>
                            <input
                                type="number"
                                min={5}
                                max={30}
                                value={form.data.walkover_grace_minutes}
                                onChange={e => form.setData('walkover_grace_minutes', parseInt(e.target.value) || 15)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-lime-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300">
                                Target Super Tie-Break (Poin)
                            </label>
                            <input
                                type="number"
                                min={5}
                                max={20}
                                value={form.data.super_tiebreak_points}
                                onChange={e => form.setData('super_tiebreak_points', parseInt(e.target.value) || 10)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-lime-400"
                            />
                        </div>
                    </div>

                    <label className="flex items-center space-x-3 cursor-pointer pt-2">
                        <input
                            type="checkbox"
                            checked={form.data.golden_point_enabled}
                            onChange={e => form.setData('golden_point_enabled', e.target.checked)}
                            className="rounded border-slate-700 text-lime-400 focus:ring-0"
                        />
                        <span className="text-xs font-bold text-white">
                            Gunakan Golden Point (Punto de Oro) pada Deuce 40-40 (Tanpa Advantage)
                        </span>
                    </label>
                </div>

                {/* Rulebook Text & External Link */}
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl space-y-4">
                    <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <div>
                            <h2 className="text-base font-bold text-white">Naskah Regulasi Turnamen (Untuk Atlet)</h2>
                            <p className="text-xs text-slate-400">Naskah ini akan ditampilkan pada tab Regulasi di halaman detail publik atlet.</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                            Ketentuan Umum Pertandingan
                        </label>
                        <textarea
                            rows={4}
                            value={form.data.rulebook_text}
                            onChange={e => form.setData('rulebook_text', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs leading-relaxed focus:outline-none focus:border-lime-400"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                            Tautan Dokumen PDF Rulebook Resmi (Opsional)
                        </label>
                        <input
                            type="url"
                            placeholder="https://drive.google.com/... atau URL dokumen PDF"
                            value={form.data.rulebook_pdf_url}
                            onChange={e => form.setData('rulebook_pdf_url', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 font-mono"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition shadow-lg shadow-lime-400/20 active:scale-95 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>Simpan Regulasi Kategori</span>
                    </button>
                </div>
            </form>
        </CategoryLayout>
    );
}
