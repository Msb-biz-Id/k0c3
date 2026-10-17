import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Search, Trophy, User, Newspaper, ArrowRight, X, Sparkles, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchResult {
    tournaments: Array<{
        id: string;
        name: string;
        slug: string;
        venue_name: string;
        city_name: string;
        status: string;
    }>;
    players: Array<{
        id: string;
        name: string;
        avatar?: string;
        city_name: string;
        skill_level: string;
    }>;
    blogs: Array<{
        id: string;
        title: string;
        slug: string;
    }>;
}

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult>({ tournaments: [], players: [], blogs: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else onClose(); // parent handles toggle
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults({ tournaments: [], players: [], blogs: [] });
            return;
        }

        if (query.trim().length < 2) {
            setResults({ tournaments: [], players: [], blogs: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
            } catch (err) {
                console.error('Search error', err);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    if (!isOpen) return null;

    const navigateTo = (url: string) => {
        onClose();
        router.visit(url);
    };

    const hasResults = results.tournaments.length > 0 || results.players.length > 0 || results.blogs.length > 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                >
                    {/* Input Header */}
                    <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3.5">
                        <Search className="h-5 w-5 text-accent-primary shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari turnamen, atlet, berita, atau venue... (ESC untuk tutup)"
                            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                            autoFocus
                        />
                        {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />}
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Results Container */}
                    <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                        {query.trim().length < 2 && (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pintasan Cepat</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <button
                                        onClick={() => navigateTo('/tournaments')}
                                        className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-3 text-left text-slate-200 hover:bg-slate-800 hover:text-accent-primary transition-colors"
                                    >
                                        <Trophy className="h-4 w-4 text-accent-primary" />
                                        <span>Katalog Turnamen</span>
                                    </button>
                                    <button
                                        onClick={() => navigateTo('/leaderboard')}
                                        className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-3 text-left text-slate-200 hover:bg-slate-800 hover:text-accent-primary transition-colors"
                                    >
                                        <User className="h-4 w-4 text-sky-400" />
                                        <span>Peringkat Atlet Nasional</span>
                                    </button>
                                    <button
                                        onClick={() => navigateTo('/blog')}
                                        className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-3 text-left text-slate-200 hover:bg-slate-800 hover:text-accent-primary transition-colors"
                                    >
                                        <Newspaper className="h-4 w-4 text-amber-400" />
                                        <span>Berita & Panduan Padel</span>
                                    </button>
                                    <button
                                        onClick={() => navigateTo('/organizer/tournaments/create')}
                                        className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-3 text-left text-slate-200 hover:bg-slate-800 hover:text-accent-primary transition-colors"
                                    >
                                        <Sparkles className="h-4 w-4 text-emerald-400" />
                                        <span>Buat Turnamen Baru</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {query.trim().length >= 2 && !loading && !hasResults && (
                            <div className="py-8 text-center text-sm text-slate-500">
                                Tidak ditemukan hasil untuk "{query}". Coba kata kunci lain.
                            </div>
                        )}

                        {/* Tournaments List */}
                        {results.tournaments.length > 0 && (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Turnamen</p>
                                <div className="space-y-1">
                                    {results.tournaments.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => navigateTo(`/tournaments/${t.slug}`)}
                                            className="w-full flex items-center justify-between rounded-xl p-2.5 text-left hover:bg-slate-800/80 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
                                                    <Trophy className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-100 group-hover:text-accent-primary">{t.name}</p>
                                                    <p className="text-xs text-slate-400">{t.venue_name} • {t.city_name}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-200 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Players List */}
                        {results.players.length > 0 && (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Pemain / Atlet</p>
                                <div className="space-y-1">
                                    {results.players.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => navigateTo(`/players/${p.id}`)}
                                            className="w-full flex items-center justify-between rounded-xl p-2.5 text-left hover:bg-slate-800/80 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 font-bold text-xs">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-100 group-hover:text-sky-400">{p.name}</p>
                                                    <p className="text-xs text-slate-400">{p.skill_level} • {p.city_name}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-200 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Blogs List */}
                        {results.blogs.length > 0 && (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Artikel Blog</p>
                                <div className="space-y-1">
                                    {results.blogs.map((b) => (
                                        <button
                                            key={b.id}
                                            onClick={() => navigateTo(`/blog/${b.slug}`)}
                                            className="w-full flex items-center justify-between rounded-xl p-2.5 text-left hover:bg-slate-800/80 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                                                    <Newspaper className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-100 group-hover:text-amber-400">{b.title}</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-200 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Guide */}
                    <div className="border-t border-slate-800 bg-slate-950/40 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">ESC</span>
                            <span>untuk menutup</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">⌘K</span>
                            <span>pencarian instan</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
