import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    BookOpen, 
    ArrowLeft, 
    Upload, 
    CheckCircle2, 
    Sparkles 
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

interface Props {
    categories: Category[];
}

export default function BlogCreate({ categories }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: categories[0]?.id || '',
        excerpt: '',
        content: '',
        meta_title: '',
        meta_description: '',
        status: 'published',
        featured_image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.blog.store'));
    };

    return (
        <AdminLayout title="Tulis Artikel Baru">
            <Head title={`Tulis Artikel Baru - ${brandName} Superadmin`} />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('admin.blog.index')}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Daftar Artikel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-400" />
                            Tulis Artikel Blog Baru
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Konten akan secara otomatis disanitasi menggunakan HTMLPurifier anti-XSS sebelum dipublikasi.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Judul Artikel:
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: 5 Tips Servis Mematikan dalam Padel untuk Pemula"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
                        </div>

                        {/* Category & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Kategori Blog:
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                >
                                    <option value="">Pilih Kategori...</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Status Publikasi:
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                >
                                    <option value="published">Langsung Publikasikan</option>
                                    <option value="draft">Simpan sebagai Draft</option>
                                </select>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Featured Banner Image:
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('featured_image', e.target.files ? e.target.files[0] : null)}
                                className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                            />
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Ringkasan Singkat (Excerpt):
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Ringkasan 1-2 kalimat untuk preview kartu dan meta search engine..."
                                value={data.excerpt}
                                onChange={(e) => setData('excerpt', e.target.value)}
                                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 text-xs text-white"
                            />
                        </div>

                        {/* Main Content */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Isi Artikel Lengkap:
                            </label>
                            <textarea
                                rows={10}
                                required
                                placeholder="Tulis artikel padel Anda di sini..."
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white font-mono leading-relaxed focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                            {errors.content && <p className="text-rose-400 text-xs mt-1">{errors.content}</p>}
                        </div>

                        {/* SEO Fields */}
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                SEO Meta Information
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Meta Title:</label>
                                    <input
                                        type="text"
                                        placeholder="Judul SEO..."
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Meta Description:</label>
                                    <input
                                        type="text"
                                        placeholder="Deskripsi SEO..."
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                        <Link
                            href={route('admin.blog.index')}
                            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
                        >
                            {processing ? 'Menyimpan...' : 'Terbitkan Artikel Sekarang'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
