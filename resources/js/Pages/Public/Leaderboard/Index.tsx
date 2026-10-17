import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    Medal, 
    Flame, 
    ArrowRight, 
    Search, 
    User, 
    MapPin, 
    TrendingUp, 
    Sparkles, 
    ShieldCheck,
    Award,
    LayoutGrid,
    ListFilter
} from 'lucide-react';
import MobileBottomNav from '@/Components/MobileBottomNav';
import CommandPalette from '@/Components/CommandPalette';
import DarkModeToggle from '@/Components/DarkModeToggle';
import FloatingWhatsApp from '@/Components/FloatingWhatsApp';

interface PlayerRankItem {
    id: string;
    rank: number;
    name: string;
    avatar?: string;
    gender: string;
    skill_level: string;
    dominant_hand: string;
    city_name: string;
    titles_count: number;
    matches_played: number;
    matches_won: number;
    win_rate: number;
}

interface PageProps {
    players: PlayerRankItem[];
    filters: {
        gender: string;
        scope: string;
        search?: string;
    };
    auth?: {
        user?: any;
    };
}

export default function LeaderboardIndex({ players, filters, auth }: PageProps) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [genderTab, setGenderTab] = useState(filters.gender || 'all');
    const [scopeFilter, setScopeFilter] = useState(filters.scope || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const handleGenderChange = (gender: string) => {
        setGenderTab(gender);
        router.get('/leaderboard', { ...filters, gender, scope: scopeFilter, search: searchQuery }, { preserveState: true });
    };

    const handleScopeChange = (scope: string) => {
        setScopeFilter(scope);
        router.get('/leaderboard', { ...filters, scope, gender: genderTab, search: searchQuery }, { preserveState: true });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/leaderboard', { ...filters, search: searchQuery, gender: genderTab, scope: scopeFilter }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-accent-primary selection:text-slate-950 pb-24 md:pb-12">
            <Head title={`Peringkat Pemain — ${brandName}`} />

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
                            <Link href="/leaderboard" className="text-accent-primary font-semibold">
                                Peringkat Atlet
                            </Link>
                            <Link href="/winners" className="text-slate-300 hover:text-white transition-colors">
                                Hall of Fame
                            </Link>
                            <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">
                                Berita & Panduan
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>Cari turnamen & atlet...</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">⌘K</kbd>
                        </button>

                        <DarkModeToggle />

                        {auth?.user ? (
                            <Link
                                href="/settings/profile"
                                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 transition"
                            >
                                Akun Saya
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-slate-950 text-xs font-bold transition shadow-md shadow-accent-primary/20"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header Title (Matching staging: "All players" & "Players ranking") */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-accent-primary mb-1">
                            Players ranking
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white">
                            All players
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            Peringkat resmi atlet padel Indonesia berdasarkan akumulasi gelar juara dan rekam jejak turnamen.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                title="Tampilan Kartu (Staging)"
                                className={`p-1.5 rounded-lg transition ${
                                    viewMode === 'grid'
                                        ? 'bg-accent-primary text-slate-950'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                title="Tampilan Tabel"
                                className={`p-1.5 rounded-lg transition ${
                                    viewMode === 'table'
                                        ? 'bg-accent-primary text-slate-950'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <ListFilter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Bar (Gender Tabs, Scope Dropdown, Search Input) */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-xl">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Gender Pills */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                            {[
                                { id: 'all', label: 'ALL' },
                                { id: 'men', label: 'MEN' },
                                { id: 'women', label: 'WOMEN' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleGenderChange(tab.id)}
                                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                                        genderTab === tab.id
                                            ? 'bg-accent-primary text-slate-950 shadow-md'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Lingkup Peringkat Dropdown */}
                        <select
                            value={scopeFilter}
                            onChange={(e) => handleScopeChange(e.target.value)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:border-accent-primary focus:ring-0"
                        >
                            <option value="all">Seluruh Indonesia (Nasional)</option>
                            <option value="Jakarta">DKI Jakarta</option>
                            <option value="Surabaya">Jawa Timur / Surabaya</option>
                            <option value="Bandung">Jawa Barat / Bandung</option>
                            <option value="Bali">Bali</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari pemain..."
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-accent-primary focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* PLAYERS CONTAINER */}
                {players.length === 0 ? (
                    <div className="text-center py-16 text-xs text-slate-500 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
                        Tidak ada pemain yang sesuai dengan filter pencarian.
                    </div>
                ) : viewMode === 'grid' ? (
                    /* 2-Column Card Grid (Matching stage.padelgigs.id exactly) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {players.map((player) => (
                            <Link
                                key={player.id}
                                href={`/leaderboard/${player.id}`}
                                className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition flex items-center justify-between gap-4 group shadow-lg"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Rank Number */}
                                    <div className="w-8 text-center text-lg sm:text-xl font-black font-mono text-slate-400 group-hover:text-accent-primary transition-colors">
                                        {player.rank}
                                    </div>

                                    {/* Avatar Circle */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 p-0.5 shrink-0 flex items-center justify-center font-bold text-white text-base shadow-inner">
                                        {player.avatar ? (
                                            <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            player.name.charAt(0)
                                        )}
                                    </div>

                                    {/* Player Info */}
                                    <div className="truncate">
                                        <div className="text-sm sm:text-base font-black text-white group-hover:text-accent-primary transition-colors truncate">
                                            {player.name}
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                            <span className="truncate">{player.city_name || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Titles Badge with Trophy */}
                                <div className="shrink-0 flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400">
                                        <Trophy className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        <span>{player.titles_count} TITLES</span>
                                    </div>
                                    <div className="hidden sm:flex w-7 h-7 rounded-lg bg-slate-800 items-center justify-center text-slate-400 group-hover:text-white transition">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-3.5">Rank</th>
                                        <th className="px-6 py-3.5">Atlet</th>
                                        <th className="px-6 py-3.5">Wilayah</th>
                                        <th className="px-6 py-3.5">Level Skill</th>
                                        <th className="px-6 py-3.5 text-center">Gelar</th>
                                        <th className="px-6 py-3.5 text-center">Menang / Main</th>
                                        <th className="px-6 py-3.5 text-center">Win Rate</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                    {players.map((player) => (
                                        <tr key={player.id} className="hover:bg-slate-850/60 transition-colors group">
                                            <td className="px-6 py-4 font-black text-slate-200">#{player.rank}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                                                        {player.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-accent-primary">{player.name}</div>
                                                        <div className="text-[10px] text-slate-500">Tangan {player.dominant_hand === 'left' ? 'Kiri' : 'Kanan'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{player.city_name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700">
                                                    {player.skill_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-amber-400">
                                                {player.titles_count} 🏆
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-slate-200">
                                                {player.matches_won} / {player.matches_played}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="rounded-full bg-accent-primary/10 border border-accent-primary/30 px-2.5 py-0.5 font-bold text-accent-primary text-[11px]">
                                                    {player.win_rate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/leaderboard/${player.id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition"
                                                >
                                                    <span>Profil</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Floating WhatsApp Support Button */}
            <FloatingWhatsApp />

            {/* Mobile PWA Bottom Nav */}
            <MobileBottomNav />
        </div>
    );
}
