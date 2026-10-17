import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    ArrowLeft, 
    Calendar, 
    User, 
    Share2, 
    ChevronRight 
} from 'lucide-react';
import MobileBottomNav from '@/Components/MobileBottomNav';
import { toast, Toaster } from 'sonner';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featured_image?: string;
    published_at: string;
    meta_title?: string;
    meta_description?: string;
    author?: { name: string };
    category?: { name: string; slug: string };
}

interface Props {
    post: BlogPost;
    relatedPosts: BlogPost[];
}

export default function PublicBlogShow({ post, relatedPosts }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link artikel berhasil disalin!');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
            <Head>
                <title>{post.meta_title || post.title} - {brandName} Editorial</title>
                {post.meta_description && <meta name="description" content={post.meta_description} />}
            </Head>
            <Toaster position="top-center" richColors />

            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href={route('blog.index')} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Blog
                    </Link>

                    <button
                        onClick={handleShare}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                        title="Bagikan Artikel"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* MAIN ARTICLE */}
            <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
                <article className="space-y-8">
                    {/* Title & Metadata */}
                    <div className="space-y-4">
                        {post.category && (
                            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 uppercase tracking-wider">
                                {post.category.name}
                            </span>
                        )}
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-b border-slate-800/80 pb-6">
                            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                                <User className="w-3.5 h-3.5 text-emerald-400" />
                                {post.author?.name || `Redaksi ${brandName}`}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Featured Image */}
                    {post.featured_image && (
                        <div className="w-full h-80 rounded-3xl overflow-hidden border border-slate-800">
                            <img
                                src={`/storage/${post.featured_image}`}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content (Sanitized) */}
                    <div 
                        className="prose prose-invert prose-emerald max-w-none text-slate-300 text-sm leading-relaxed space-y-4 font-normal"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                    <div className="border-t border-slate-800/80 pt-10 space-y-6">
                        <h3 className="font-bold text-white text-lg">Artikel Terkait Lainnya</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {relatedPosts.map((r) => (
                                <Link
                                    key={r.id}
                                    href={route('blog.show', r.slug)}
                                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-2 flex flex-col justify-between"
                                >
                                    <h4 className="font-bold text-white text-xs line-clamp-2 hover:text-emerald-400 transition">
                                        {r.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-500">
                                        {new Date(r.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
