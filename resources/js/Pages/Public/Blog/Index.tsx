import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    ArrowLeft, 
    Calendar, 
    User, 
    ChevronRight, 
    Sparkles 
} from 'lucide-react';
import MobileBottomNav from '@/Components/MobileBottomNav';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image?: string;
    published_at: string;
    author?: { name: string };
    category?: { name: string; slug: string };
}

interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    posts_count: number;
}

interface Props {
    posts: {
        data: BlogPost[];
        links: any[];
        total: number;
    };
    categories: BlogCategory[];
    currentCategory?: string;
}

export default function PublicBlogIndex({ posts, categories, currentCategory }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
            <Head title={`Blog & Berita - ${brandName}`} />

            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>

                    <span className="text-sm font-black text-white">
                        {brandName} <span className="text-emerald-400">BLOG</span>
                    </span>
                </div>
            </header>

            {/* MAIN BLOG CONTENT */}
            <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        Wawasan & Berita
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                        {brandName} Editorial
                    </h1>
                    <p className="text-sm text-slate-400">
                        Tips teknik servis, regulasi pertandingan resmi FIP, dan kabar turnamen terbaru di Indonesia.
                    </p>
                </div>

                {/* Categories Filter */}
                <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
                    <Link
                        href={route('blog.index')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                            !currentCategory ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                    >
                        Semua Kategori
                    </Link>
                    {categories.map((c) => (
                        <Link
                            key={c.id}
                            href={route('blog.index', { category: c.slug })}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                                currentCategory === c.slug ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                        >
                            {c.name} ({c.posts_count})
                        </Link>
                    ))}
                </div>

                {/* Posts Grid */}
                {posts.data.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
                        <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                        <h3 className="text-lg font-bold text-white">Belum Ada Artikel</h3>
                        <p className="text-xs text-slate-500">
                            Nantikan tips dan liputan turnamen menarik lainnya dari kami.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.data.map((post) => (
                            <div 
                                key={post.id}
                                className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
                            >
                                <div>
                                    <div className="h-44 bg-slate-950 relative overflow-hidden">
                                        {post.featured_image ? (
                                            <img
                                                src={`/storage/${post.featured_image}`}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-700">
                                                <BookOpen className="w-10 h-10" />
                                            </div>
                                        )}
                                        {post.category && (
                                            <div className="absolute top-3 left-3">
                                                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-slate-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                                                    {post.category.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 space-y-3">
                                        <h3 className="text-base font-bold text-white hover:text-emerald-400 transition line-clamp-2">
                                            <Link href={route('blog.show', post.slug)}>
                                                {post.title}
                                            </Link>
                                        </h3>
                                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 pt-0 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 mt-4">
                                    <span>{new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    <Link
                                        href={route('blog.show', post.slug)}
                                        className="text-emerald-400 font-bold flex items-center gap-1 hover:text-emerald-300 transition"
                                    >
                                        Baca
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
