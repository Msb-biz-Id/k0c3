import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    BookOpen, 
    Plus, 
    Trash2, 
    Calendar, 
    User, 
    Eye, 
    ExternalLink 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    author?: { name: string };
    category?: { name: string };
}

interface Props {
    posts: {
        data: BlogPost[];
        links: any[];
        total: number;
    };
}

export default function BlogIndex({ posts }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Hapus artikel "${title}"?`)) {
            router.delete(route('admin.blog.destroy', id), {
                onSuccess: () => toast.success('Artikel berhasil dihapus.')
            });
        }
    };

    return (
        <AdminLayout title="Blog & Berita Padel">
            <Head title={`Manajemen Blog - ${brandName} Superadmin`} />
            <Toaster position="top-right" richColors />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-emerald-400" />
                            Blog & Berita Padel ({posts.total})
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Publikasi artikel tips padel, regulasi turnamen, dan liputan kejuaraan resmi.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.blog.create')}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition"
                        >
                            <Plus className="w-4 h-4" />
                            Tulis Artikel Baru
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/60">
                                    <th className="py-3.5 px-6">Judul Artikel</th>
                                    <th className="py-3.5 px-4">Kategori</th>
                                    <th className="py-3.5 px-4">Penulis</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {posts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            Belum ada artikel yang ditulis.
                                        </td>
                                    </tr>
                                ) : (
                                    posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-800/20">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-white text-sm">
                                                    {post.title}
                                                </div>
                                                <span className="text-[11px] font-mono text-slate-500 mt-0.5 block">
                                                    /{post.slug}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-300">
                                                {post.category?.name || 'Umum'}
                                            </td>
                                            <td className="py-4 px-4 text-slate-400">
                                                {post.author?.name || 'Superadmin'}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    post.status === 'published'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                    {post.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('blog.show', post.slug)}
                                                        target="_blank"
                                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                                        title="Lihat Halaman Publik"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post.id, post.title)}
                                                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                                                        title="Hapus Artikel"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
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
