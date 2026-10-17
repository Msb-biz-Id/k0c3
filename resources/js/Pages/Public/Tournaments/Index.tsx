import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    Calendar, 
    MapPin, 
    Users, 
    ArrowRight, 
    Search, 
    Filter, 
    Sparkles, 
    Activity, 
    Flame,
    CheckCircle2,
    Clock
} from 'lucide-react';
import MobileBottomNav from '@/Components/MobileBottomNav';
import CommandPalette from '@/Components/CommandPalette';
import DarkModeToggle from '@/Components/DarkModeToggle';
import FloatingWhatsApp from '@/Components/FloatingWhatsApp';

interface TournamentItem {
    id: string;
    name: string;
    slug: string;
    sport_type: string;
    start_date: string;
    end_date: string;
    venue_name: string;
    city_name: string;
    province_name?: string;
    status: string;
    featured_image?: {
        image_path: string;
    };
    user?: {
        name: string;
    };
    categories?: Array<{
        id: string;
        name: string;
        max_teams: number;
        registration_fee: number;
        teams?: Array<any>;
    }>;
}

interface PageProps {
    tournaments: {
        data: TournamentItem[];
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    filters: {
        tab: string;
        search?: string;
        province_id?: string;
        sport_type?: string;
    };
    auth?: {
        user?: any;
    };
}

export default function TournamentsIndex({ tournaments, filters, auth }: PageProps) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.tab || 'all');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/tournaments', { ...filters, tab, search: searchQuery }, { preserveState: true });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/tournaments', { ...filters, search: searchQuery, tab: activeTab }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-accent-primary selection:text-slate-950 pb-24 md:pb-12">
            <Head title={`Katalog Turnamen | ${brandName}`} />

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
                            <Link href="/tournaments" className="text-accent-primary font-semibold">
                                Turnamen
                            </Link>
                            <Link href="/leaderboard" className="text-slate-300 hover:text-white transition-colors">
                                Peringkat Atlet
                            </Link>
                            <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">
                                Berita & Panduan
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
                        >
                            <Search className="h-3.5 w-3.5" />
                            <span>Cari turnamen...</span>
                            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">⌘K</kbd>
                        </button>

                        <DarkModeToggle />

                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-xl bg-accent-primary px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-accent-hover transition-colors shadow-sm"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Title */}
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-3 py-1 text-xs font-semibold text-accent-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Katalog Turnamen Resmi & Komunitas</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                        Jadwal Turnamen Padel Terkini
                    </h1>
                    <p className="text-sm text-slate-400 max-w-2xl">
                        Temukan turnamen padel tingkat Beginner, Intermediate, hingga Open di seluruh Indonesia. Daftarkan tim Anda sekarang sebelum kuota penuh.
                    </p>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-xl">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        {[
                            { id: 'all', label: 'Semua Status' },
                            { id: 'upcoming', label: 'Mendatang' },
                            { id: 'live', label: 'Sedang Berlangsung' },
                            { id: 'completed', label: 'Selesai' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-accent-primary text-slate-950 font-bold shadow-md shadow-accent-primary/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama atau kota..."
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-accent-primary focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Tournaments Grid */}
                {tournaments.data.length === 0 ? (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                        <Trophy className="mx-auto h-12 w-12 text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-300">Belum Ada Turnamen Ditemukan</h2>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Tidak ada turnamen yang cocok dengan filter yang Anda pilih. Silakan ganti kata kunci atau pilih tab status lain.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.data.map((t) => {
                            const totalMaxTeams = t.categories?.reduce((acc, cat) => acc + (cat.max_teams || 0), 0) || 0;
                            const totalRegisteredTeams = t.categories?.reduce((acc, cat) => acc + (cat.teams?.length || 0), 0) || 0;
                            const isRegistrationOpen = t.status === 'published' && totalRegisteredTeams < totalMaxTeams;

                            return (
                                <div
                                    key={t.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-accent-primary/5"
                                >
                                    <div className="space-y-4">
                                        {/* Featured Poster or Header */}
                                        <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-800">
                                            {t.featured_image?.image_path ? (
                                                <img
                                                    src={t.featured_image.image_path}
                                                    alt={t.name}
                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                    <Trophy className="h-12 w-12 text-slate-700" />
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3">
                                                {t.status === 'ongoing' ? (
                                                    <span className="flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md animate-pulse">
                                                        <Activity className="h-3 w-3" />
                                                        LIVE MATCH
                                                    </span>
                                                ) : isRegistrationOpen ? (
                                                    <span className="flex items-center gap-1.5 rounded-full bg-accent-primary/95 px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-lg backdrop-blur-md">
                                                        <Flame className="h-3 w-3" />
                                                        REGISTRATION OPEN
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 rounded-full bg-slate-800/90 px-2.5 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-md">
                                                        <CheckCircle2 className="h-3 w-3 text-slate-400" />
                                                        SELESAI
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tournament Details */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Calendar className="h-3.5 w-3.5 text-accent-primary shrink-0" />
                                                <span>{t.start_date} s/d {t.end_date}</span>
                                            </div>

                                            <h2 className="text-base font-bold text-white group-hover:text-accent-primary transition-colors line-clamp-1">
                                                {t.name}
                                            </h2>

                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                                <span className="truncate">{t.venue_name} • {t.city_name}</span>
                                            </div>
                                        </div>

                                        {/* Quota Progress */}
                                        {totalMaxTeams > 0 && (
                                            <div className="space-y-1.5 rounded-xl bg-slate-950/40 p-2.5 border border-slate-800/60">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-slate-400 flex items-center gap-1">
                                                        <Users className="h-3 w-3 text-accent-primary" />
                                                        Kuota Peserta
                                                    </span>
                                                    <span className="font-semibold text-slate-200">
                                                        {totalRegisteredTeams} / {totalMaxTeams} Tim
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                                    <div
                                                        className="h-full bg-accent-primary rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, (totalRegisteredTeams / totalMaxTeams) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                                        <Link
                                            href={`/tournaments/${t.slug}`}
                                            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                                        >
                                            <span>Lihat Jadwal</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>

                                        {isRegistrationOpen && (
                                            <Link
                                                href={`/tournaments/${t.slug}/register`}
                                                className="rounded-xl bg-accent-primary px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-accent-hover transition-colors shadow-sm"
                                            >
                                                Daftar Sekarang
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {tournaments.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6">
                        {tournaments.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                    link.active
                                        ? 'bg-accent-primary text-slate-950 font-bold'
                                        : link.url
                                        ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                                        : 'text-slate-600 cursor-not-allowed'
                                }`}
                            />
                        ))}
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
