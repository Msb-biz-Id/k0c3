import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    Medal, 
    Calendar, 
    MapPin, 
    Search, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight,
    ExternalLink,
    Filter,
    Award,
    Sparkles
} from 'lucide-react';
import MobileBottomNav from '@/Components/MobileBottomNav';
import CommandPalette from '@/Components/CommandPalette';
import DarkModeToggle from '@/Components/DarkModeToggle';
import FloatingWhatsApp from '@/Components/FloatingWhatsApp';

interface WinnerItem {
    id: string;
    user_id: string;
    rank: number;
    player_image_url?: string | null;
    name_jersey?: string | null;
    province_name?: string | null;
    user: {
        name: string;
    };
    tournament_id: string;
    tournament_name: string;
    tournament_date: string;
    division_label: string;
    skill_level_label: string;
}

interface SkillLevelOption {
    value: string;
    label: string;
    color: string;
}

interface ScopeOption {
    value: string;
    label: string;
}

interface PageProps {
    winners: {
        data: WinnerItem[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    skillLevelOptions: SkillLevelOption[];
    winnerScopeOptions: ScopeOption[];
    filters: {
        winners_month?: string | null;
        skill_level?: string | null;
        search?: string | null;
        winners_scope?: string;
    };
    auth?: {
        user?: any;
    };
}

export default function WinnersIndex({ 
    winners, 
    skillLevelOptions, 
    winnerScopeOptions, 
    filters,
    auth 
}: PageProps) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const currentScope = filters.winners_scope || 'tournament';

    const handleScopeChange = (scopeValue: string) => {
        router.get('/winners', {
            ...filters,
            winners_scope: scopeValue,
            page: 1,
        }, { preserveState: true, replace: true });
    };

    const handleSkillLevelChange = (skillValue: string) => {
        router.get('/winners', {
            ...filters,
            skill_level: skillValue || undefined,
            page: 1,
        }, { preserveState: true, replace: true });
    };

    const handleMonthChange = (monthValue: string) => {
        router.get('/winners', {
            ...filters,
            winners_month: monthValue || undefined,
            page: 1,
        }, { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/winners', {
            ...filters,
            search: searchQuery || undefined,
            page: 1,
        }, { preserveState: true, replace: true });
    };

    const getRankBadgeStyle = (rank: number) => {
        if (rank === 1) {
            return 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.4)] border-amber-300';
        }
        if (rank === 2) {
            return 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-950 font-black shadow-[0_0_15px_rgba(203,213,225,0.3)] border-slate-300';
        }
        if (rank === 3) {
            return 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white font-black shadow-[0_0_15px_rgba(180,83,9,0.3)] border-amber-600';
        }
        return 'bg-slate-900 border border-slate-800 text-slate-400 font-bold';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-accent-primary selection:text-slate-950 pb-24 md:pb-12">
            <Head title={`Winners — Juara Turnamen | ${brandName}`} />

            {/* Global Search Modal */}
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary text-slate-950 font-black shadow-[0_0_15px_var(--app-accent-glow,rgba(163,230,53,0.3))]">
                                <Trophy className="h-5 w-5 fill-current" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white group-hover:text-accent-primary transition-colors">
                                {brandName}
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link href="/tournaments" className="text-slate-300 hover:text-white transition-colors">
                                Turnamen
                            </Link>
                            <Link href="/leaderboard" className="text-slate-300 hover:text-white transition-colors">
                                Players
                            </Link>
                            <Link href="/winners" className="text-accent-primary font-semibold">
                                Winners
                            </Link>
                            <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">
                                Berita
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 transition"
                        >
                            <Search className="h-3.5 w-3.5" />
                            <span>Cari turnamen, atlet...</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">⌘K</kbd>
                        </button>

                        <DarkModeToggle />

                        {auth?.user ? (
                            <Link
                                href="/settings/profile"
                                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:bg-slate-800 transition"
                            >
                                {auth.user.name.split(' ')[0]}
                            </Link>
                        ) : (
                            <Link
                                href="/register/player"
                                className="px-4 py-2 rounded-xl bg-accent-primary text-slate-950 text-xs font-black shadow-lg shadow-accent-primary/20 hover:opacity-95 transition"
                            >
                                Daftar sebagai Player
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
                
                {/* Header Title Section (matching staging) */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-primary">
                        <Award className="w-4 h-4" />
                        <span>Champions of the Court</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Winners
                    </h1>
                    <p className="text-sm md:text-base text-slate-400 max-w-2xl">
                        Players with the best performance in each tournament, ranked by wins.
                    </p>
                </div>

                {/* Scope Selector: Public vs Community */}
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800/80 pb-5">
                    <div className="inline-flex p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
                        {winnerScopeOptions.map((opt) => {
                            const isSelected = currentScope === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleScopeChange(opt.value)}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                                        isSelected
                                            ? 'bg-accent-primary text-slate-950 shadow-md shadow-accent-primary/20 font-black'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="text-xs text-slate-400">
                        Total: <span className="font-bold text-white">{winners.total}</span> Pemenang Terdata
                    </div>
                </div>

                {/* Filters Row: Skill Level, Month, and Search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Skill Level Dropdown */}
                    <div className="relative">
                        <select
                            value={filters.skill_level || ''}
                            onChange={(e) => handleSkillLevelChange(e.target.value)}
                            className="w-full appearance-none rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 text-xs text-slate-200 focus:border-accent-primary focus:outline-none transition pr-10"
                        >
                            <option value="">Semua Skill Level</option>
                            {skillLevelOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    </div>

                    {/* Month Dropdown */}
                    <div className="relative">
                        <select
                            value={filters.winners_month || ''}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            className="w-full appearance-none rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 text-xs text-slate-200 focus:border-accent-primary focus:outline-none transition pr-10"
                        >
                            <option value="">Semua Bulan</option>
                            <option value="2026-10">Oktober 2026</option>
                            <option value="2026-09">September 2026</option>
                            <option value="2026-08">Agustus 2026</option>
                            <option value="2026-07">Juli 2026</option>
                            <option value="2026-06">Juni 2026</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} className="relative lg:col-span-2">
                        <input
                            type="text"
                            placeholder="Cari pemain atau turnamen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-500 focus:border-accent-primary focus:outline-none transition"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </form>
                </div>

                {/* 2-Column Winners Grid (matching staging layout) */}
                {winners.data.length === 0 ? (
                    <div className="text-center py-24 rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 p-8 space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-500">
                            <Trophy className="h-7 w-7" />
                        </div>
                        <h3 className="text-base font-bold text-white">Tidak Ada Pemenang Ditemukan</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Belum ada rekap data juara yang sesuai dengan filter yang Anda pilih. Coba sesuaikan filter level skill, bulan, atau kata kunci pencarian.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {winners.data.map((item) => (
                            <div 
                                key={item.id}
                                className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 p-5 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg shadow-black/20"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3.5">
                                        {/* Rank Badge */}
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs ${getRankBadgeStyle(item.rank)}`}>
                                            #{item.rank}
                                        </div>

                                        {/* Avatar */}
                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-800 border border-slate-700/80 shrink-0 flex items-center justify-center text-sm font-black text-slate-300">
                                            {item.player_image_url ? (
                                                <img 
                                                    src={item.player_image_url} 
                                                    alt={item.user.name} 
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span>{item.user.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>

                                        {/* Player Details */}
                                        <div className="space-y-0.5 truncate">
                                            <Link 
                                                href={`/leaderboard/${item.user_id}`}
                                                className="font-bold text-sm text-white group-hover:text-accent-primary transition-colors truncate block"
                                            >
                                                {item.user.name}
                                            </Link>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                {item.province_name && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-slate-500" />
                                                        {item.province_name}
                                                    </span>
                                                )}
                                                {item.name_jersey && item.name_jersey !== item.user.name && (
                                                    <span className="text-slate-500 truncate">
                                                        "{item.name_jersey}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Division / Level Pill */}
                                    <div className="shrink-0 text-right">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] font-bold text-slate-200">
                                            <Sparkles className="w-2.5 h-2.5 text-accent-primary" />
                                            {item.skill_level_label}
                                        </span>
                                    </div>
                                </div>

                                {/* Tournament Details Box */}
                                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                                    <div className="truncate pr-2">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Turnamen</span>
                                        <Link 
                                            href={`/tournaments/${item.tournament_id}`}
                                            className="font-semibold text-slate-200 hover:text-accent-primary transition truncate block"
                                        >
                                            {item.tournament_name}
                                        </Link>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Divisi & Tanggal</span>
                                        <span className="font-medium text-slate-300">
                                            {item.division_label} • {new Date(item.tournament_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {winners.total > 0 && winners.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
                        <div className="text-xs text-slate-400">
                            Menampilkan <span className="font-bold text-white">{winners.from || 0}</span> - <span className="font-bold text-white">{winners.to || 0}</span> dari <span className="font-bold text-white">{winners.total}</span> pemenang
                        </div>

                        <div className="flex items-center gap-1.5">
                            {winners.links.map((link, idx) => {
                                const isPrev = link.label.includes('&laquo;') || link.label.toLowerCase().includes('sebelum');
                                const isNext = link.label.includes('&raquo;') || link.label.toLowerCase().includes('selanjut');
                                
                                if (!link.url && (isPrev || isNext)) {
                                    return (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 rounded-xl border border-slate-800/50 bg-slate-900/30 text-xs text-slate-600 cursor-not-allowed"
                                        >
                                            {isPrev ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </span>
                                    );
                                }

                                if (isPrev || isNext) {
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition"
                                        >
                                            {isPrev ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </Link>
                                    );
                                }

                                return (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                            link.active
                                                ? 'bg-accent-primary text-slate-950 shadow-md shadow-accent-primary/20'
                                                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* Floating WhatsApp Support Button */}
            <FloatingWhatsApp />

            {/* Mobile Bottom Navigation Bar */}
            <MobileBottomNav />
        </div>
    );
}
