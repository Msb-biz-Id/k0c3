import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    Calendar, 
    MapPin, 
    Activity, 
    Clock, 
    CheckCircle2, 
    Tv, 
    ArrowLeft, 
    Sparkles, 
    Users, 
    GitBranch, 
    Info, 
    Share2, 
    Layers,
    ChevronRight,
    ChevronDown,
    ExternalLink,
    Search,
    Filter,
    Download,
    X,
    Eye,
    Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MobileBottomNav from '@/Components/MobileBottomNav';
import DarkModeToggle from '@/Components/DarkModeToggle';
import FloatingWhatsApp from '@/Components/FloatingWhatsApp';
import { toast, Toaster } from 'sonner';

interface Team {
    id: string;
    name: string;
    players?: { name: string; player_order?: number }[];
}

interface Match {
    id: string;
    category_id: string;
    stage: string;
    round_name: string;
    match_number: number;
    team1_id?: string;
    team2_id?: string;
    team1?: Team;
    team2?: Team;
    team1_set1_score?: number;
    team2_set1_score?: number;
    team1_set2_score?: number;
    team2_set2_score?: number;
    team1_set3_score?: number;
    team2_set3_score?: number;
    current_game_score?: string;
    server_team?: number;
    winner_team_id?: string;
    winner_team?: Team;
    court?: { id: string; name: string };
    status: 'pending' | 'in_progress' | 'completed';
    scheduled_time?: string;
    category?: { 
        id: string; 
        name: string;
        tier_name?: string;
        division_name?: string;
        skill_level_name?: string;
    };
}

interface Category {
    id: string;
    name: string;
    tier_name?: string;
    division_name?: string;
    skill_level_name?: string;
    registration_fee: number;
    max_teams: number;
    teams?: any[];
}

interface Tournament {
    id: string;
    name: string;
    slug: string;
    venue_name: string;
    venue_address?: string;
    city_name: string;
    province_name: string;
    start_date: string;
    end_date: string;
    status: string;
    registration_guide?: string;
    images?: { id: string; image_path: string; is_featured: boolean }[];
    courts?: { id: string; name: string }[];
    categories: Category[];
}

interface Props {
    tournament: Tournament;
    matches: Match[];
    standingsByCategory: Record<string, Record<string, any[]>>;
}

export default function TournamentShow({ tournament, matches, standingsByCategory }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const [activeTab, setActiveTab] = useState<'live' | 'schedule' | 'results' | 'standings' | 'bracket' | 'slideshow' | 'info'>('schedule');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(tournament.categories[0]?.id || '');
    const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
    const [selectedMatchModal, setSelectedMatchModal] = useState<Match | null>(null);

    // Order of play filters
    const [scheduleSort, setScheduleSort] = useState<'asc' | 'desc'>('asc');
    const [scheduleRound, setScheduleRound] = useState<string>('all');
    const [scheduleCategory, setScheduleCategory] = useState<string>('all');
    const [scheduleSearch, setScheduleSearch] = useState<string>('');

    // Results filters
    const [resultsSort, setResultsSort] = useState<'desc' | 'asc'>('desc');
    const [resultsRound, setResultsRound] = useState<string>('all');
    const [resultsCategory, setResultsCategory] = useState<string>('all');
    const [resultsSearch, setResultsSearch] = useState<string>('');

    // Leaderboard sub-view: Per Grup vs Lintas Grup
    const [standingsViewMode, setStandingsViewMode] = useState<'by_group' | 'cross_group'>('by_group');

    const liveMatches = useMemo(() => matches.filter(m => m.status === 'in_progress'), [matches]);
    const scheduledMatches = useMemo(() => matches.filter(m => m.status === 'pending'), [matches]);
    const completedMatches = useMemo(() => matches.filter(m => m.status === 'completed'), [matches]);

    // Set default tab to live if there are active matches
    useEffect(() => {
        if (liveMatches.length > 0 && activeTab === 'schedule') {
            setActiveTab('live');
        }
    }, [liveMatches.length]);

    // Auto-refresh polling for live scores and standings every 8s
    useEffect(() => {
        if (activeTab !== 'live' && activeTab !== 'standings') return;

        const interval = setInterval(() => {
            router.reload({
                only: ['matches', 'standingsByCategory'],
            });
        }, 8000);

        return () => clearInterval(interval);
    }, [activeTab]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: tournament.name,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link turnamen berhasil disalin!');
        }
    };

    // Filtered Order of Play Matches
    const filteredScheduleMatches = useMemo(() => {
        return scheduledMatches.filter((m) => {
            if (scheduleCategory !== 'all' && m.category_id !== scheduleCategory) return false;
            if (scheduleRound !== 'all' && m.round_name !== scheduleRound && m.stage !== scheduleRound) return false;
            if (scheduleSearch) {
                const term = scheduleSearch.toLowerCase();
                const t1 = m.team1?.name?.toLowerCase() || '';
                const t2 = m.team2?.name?.toLowerCase() || '';
                const players1 = m.team1?.players?.map(p => p.name.toLowerCase()).join(' ') || '';
                const players2 = m.team2?.players?.map(p => p.name.toLowerCase()).join(' ') || '';
                if (!t1.includes(term) && !t2.includes(term) && !players1.includes(term) && !players2.includes(term)) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => {
            const timeA = a.scheduled_time ? new Date(a.scheduled_time).getTime() : 0;
            const timeB = b.scheduled_time ? new Date(b.scheduled_time).getTime() : 0;
            return scheduleSort === 'asc' ? timeA - timeB : timeB - timeA;
        });
    }, [scheduledMatches, scheduleCategory, scheduleRound, scheduleSearch, scheduleSort]);

    // Filtered Results Matches
    const filteredCompletedMatches = useMemo(() => {
        return completedMatches.filter((m) => {
            if (resultsCategory !== 'all' && m.category_id !== resultsCategory) return false;
            if (resultsRound !== 'all' && m.round_name !== resultsRound && m.stage !== resultsRound) return false;
            if (resultsSearch) {
                const term = resultsSearch.toLowerCase();
                const t1 = m.team1?.name?.toLowerCase() || '';
                const t2 = m.team2?.name?.toLowerCase() || '';
                const players1 = m.team1?.players?.map(p => p.name.toLowerCase()).join(' ') || '';
                const players2 = m.team2?.players?.map(p => p.name.toLowerCase()).join(' ') || '';
                if (!t1.includes(term) && !t2.includes(term) && !players1.includes(term) && !players2.includes(term)) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => {
            const numA = a.match_number || 0;
            const numB = b.match_number || 0;
            return resultsSort === 'desc' ? numB - numA : numA - numB;
        });
    }, [completedMatches, resultsCategory, resultsRound, resultsSearch, resultsSort]);

    const currentCategoryStandings = standingsByCategory[selectedCategoryId] || {};
    const groupLetters = Object.keys(currentCategoryStandings).sort();

    // Flattened Standings for "Lintas Grup" view
    const crossGroupStandings = useMemo(() => {
        const allRows: any[] = [];
        groupLetters.forEach((letter) => {
            const rows = currentCategoryStandings[letter] || [];
            rows.forEach((r: any) => {
                allRows.push({ ...r, group_letter: letter });
            });
        });
        return allRows.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.game_diff !== a.game_diff) return b.game_diff - a.game_diff;
            return b.games_won - a.games_won;
        });
    }, [currentCategoryStandings, groupLetters]);

    const currentCategoryKnockoutMatches = matches.filter(
        m => m.category_id === selectedCategoryId && m.stage === 'knockout'
    );

    // Unique round names for filters
    const availableRounds = useMemo(() => {
        const rounds = new Set<string>();
        matches.forEach(m => {
            if (m.round_name) rounds.add(m.round_name);
        });
        return Array.from(rounds);
    }, [matches]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-accent-primary selection:text-slate-950 pb-20 md:pb-10 font-sans antialiased">
            <Head title={`${tournament.name} — Live Score & Bracket | ${brandName}`} />
            <Toaster position="top-center" richColors />

            {/* TOP HEADER BAR */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>

                    <div className="flex items-center gap-3">
                        <DarkModeToggle />

                        <button
                            onClick={handleShare}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                            title="Bagikan Turnamen"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>

                        <a
                            href={route('tournaments.slideshow', tournament.slug || tournament.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:flex px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 items-center gap-2 transition"
                        >
                            <Tv className="w-4 h-4 text-accent-primary" />
                            Mode TV Kiosk 16:9
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                    </div>
                </div>
            </header>

            {/* TOURNAMENT HERO SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4 w-full">
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-start justify-between shadow-2xl relative overflow-hidden">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-primary text-xs font-bold uppercase tracking-wider">
                                {tournament.status}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-accent-primary" />
                                {tournament.venue_name}, {tournament.city_name}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            {tournament.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                            <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                {new Date(tournament.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(tournament.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                                <Users className="w-4 h-4 text-slate-500" />
                                {tournament.categories.length} Kategori Tanding
                            </span>
                        </div>
                    </div>

                    {/* Image Thumbnail Showcase */}
                    {tournament.images && tournament.images.length > 0 && (
                        <div className="w-full lg:w-72 h-44 rounded-2xl overflow-hidden border border-slate-800 relative shrink-0">
                            <img
                                src={`/storage/${tournament.images[selectedImageIdx]?.image_path}`}
                                alt="Tournament"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* TAB NAVIGATION STRIP (Matching Staging) */}
            <div className="sticky top-[57px] z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
                    {[
                        { id: 'live', label: 'Live Score', icon: Activity, count: liveMatches.length },
                        { id: 'schedule', label: 'Order of Play', icon: Clock, count: scheduledMatches.length },
                        { id: 'results', label: 'Results', icon: CheckCircle2, count: completedMatches.length },
                        { id: 'standings', label: 'Leaderboard', icon: Layers },
                        { id: 'bracket', label: 'Bracket', icon: GitBranch },
                        { id: 'slideshow', label: 'Slideshow', icon: Tv },
                        { id: 'info', label: 'Info & Panduan', icon: Info },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition relative ${
                                    isActive 
                                        ? 'bg-accent-primary text-slate-950 shadow-lg shadow-accent-primary/20 font-black' 
                                        : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                        isActive ? 'bg-slate-950 text-accent-primary' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* MAIN TAB CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
                
                {/* 1. TAB LIVE SCORE */}
                {activeTab === 'live' && (
                    <div className="space-y-6">
                        {liveMatches.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
                                <Activity className="w-12 h-12 text-slate-600 mx-auto" />
                                <h3 className="text-lg font-bold text-white">Tidak Ada Pertandingan yang Sedang Berjalan</h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Saat wasit memulai pertandingan di court control, papan skor TV live akan muncul secara otomatis di sini.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {liveMatches.map((match) => (
                                    <div 
                                        key={match.id}
                                        className="bg-slate-900/80 border border-accent-primary/40 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5"
                                    >
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-400">
                                                {match.court?.name} • {match.category?.name}
                                            </span>
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/15 text-accent-primary font-black animate-pulse">
                                                <span className="w-2 h-2 rounded-full bg-accent-primary" />
                                                LIVE
                                            </span>
                                        </div>

                                        {/* TV Scoreboard Box */}
                                        <div className="space-y-3">
                                            {/* Team 1 */}
                                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2 truncate pr-2">
                                                    {match.server_team === 1 && (
                                                        <Sparkles className="w-4 h-4 text-accent-primary shrink-0" />
                                                    )}
                                                    <span className="font-bold text-base text-white truncate">
                                                        {match.team1?.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {match.current_game_score && (
                                                        <span className="text-xs font-mono text-amber-400 font-bold">
                                                            {match.current_game_score.split('-')[0]?.trim()}
                                                        </span>
                                                    )}
                                                    <span className="text-2xl font-black text-accent-primary font-mono px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                                                        {match.team1_set1_score ?? 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Team 2 */}
                                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2 truncate pr-2">
                                                    {match.server_team === 2 && (
                                                        <Sparkles className="w-4 h-4 text-accent-primary shrink-0" />
                                                    )}
                                                    <span className="font-bold text-base text-white truncate">
                                                        {match.team2?.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {match.current_game_score && (
                                                        <span className="text-xs font-mono text-amber-400 font-bold">
                                                            {match.current_game_score.split('-')[1]?.trim()}
                                                        </span>
                                                    )}
                                                    <span className="text-2xl font-black text-accent-primary font-mono px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                                                        {match.team2_set1_score ?? 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. TAB ORDER OF PLAY / SCHEDULE (With Complete Filter Suite) */}
                {activeTab === 'schedule' && (
                    <div className="space-y-6">
                        {/* Filter Bar matching staging */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={scheduleSort}
                                    onChange={(e) => setScheduleSort(e.target.value as any)}
                                    className="w-full appearance-none rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:border-accent-primary focus:outline-none transition pr-9"
                                >
                                    <option value="asc">Terlama Terjadwal</option>
                                    <option value="desc">Terbaru Terjadwal</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Round Filter */}
                            <div className="relative">
                                <select
                                    value={scheduleRound}
                                    onChange={(e) => setScheduleRound(e.target.value)}
                                    className="w-full appearance-none rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:border-accent-primary focus:outline-none transition pr-9"
                                >
                                    <option value="all">Semua Babak</option>
                                    {availableRounds.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Category Filter */}
                            <div className="relative">
                                <select
                                    value={scheduleCategory}
                                    onChange={(e) => setScheduleCategory(e.target.value)}
                                    className="w-full appearance-none rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:border-accent-primary focus:outline-none transition pr-9"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {tournament.categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari pemain / tim..."
                                    value={scheduleSearch}
                                    onChange={(e) => setScheduleSearch(e.target.value)}
                                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:border-accent-primary focus:outline-none transition"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            </div>
                        </div>

                        {/* Schedule Cards Grid */}
                        {filteredScheduleMatches.length === 0 ? (
                            <div className="text-center py-16 text-xs text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                                Tidak ada jadwal pertandingan yang sesuai dengan filter.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredScheduleMatches.map((match) => (
                                    <div 
                                        key={match.id}
                                        className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                                    >
                                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                                            <span className="font-bold text-accent-primary">{match.category?.name}</span>
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                                                Match #{match.match_number}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 font-bold text-white text-sm">
                                                {match.team1?.name || 'TBD'}
                                            </div>
                                            <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">VS</div>
                                            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 font-bold text-white text-sm">
                                                {match.team2?.name || 'TBD'}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                                            <span className="flex items-center gap-1 font-semibold text-slate-300">
                                                <MapPin className="w-3 h-3 text-accent-primary" />
                                                {match.court?.name || 'Belum Ditentukan'}
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-mono">
                                                {match.scheduled_time 
                                                    ? new Date(match.scheduled_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
                                                    : 'TBA'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. TAB RESULTS (With Filters & Match Detail Modal) */}
                {activeTab === 'results' && (
                    <div className="space-y-6">
                        {/* Results Filter Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={resultsSort}
                                    onChange={(e) => setResultsSort(e.target.value as any)}
                                    className="w-full appearance-none rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:border-accent-primary focus:outline-none transition pr-9"
                                >
                                    <option value="desc">Terbaru Selesai</option>
                                    <option value="asc">Terlama Selesai</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Round Filter */}
                            <div className="relative">
                                <select
                                    value={resultsRound}
                                    onChange={(e) => setResultsRound(e.target.value)}
                                    className="w-full appearance-none rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:border-accent-primary focus:outline-none transition pr-9"
                                >
                                    <option value="all">Semua Babak</option>
                                    {availableRounds.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Category Filter */}
                            <div className="relative">
                                <select
                                    value={resultsCategory}
                                    onChange={(e) => setResultsCategory(e.target.value)}
                                    className="w-full appearance-none rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:border-accent-primary focus:outline-none transition pr-9"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {tournament.categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari pemain / tim..."
                                    value={resultsSearch}
                                    onChange={(e) => setResultsSearch(e.target.value)}
                                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:border-accent-primary focus:outline-none transition"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            </div>
                        </div>

                        {/* Results Grid */}
                        {filteredCompletedMatches.length === 0 ? (
                            <div className="text-center py-16 text-xs text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                                Belum ada pertandingan yang selesai sesuai filter.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredCompletedMatches.map((match) => (
                                    <div 
                                        key={match.id}
                                        className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                                    >
                                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                                            <span>{match.category?.name} • Match #{match.match_number}</span>
                                            <span className="flex items-center gap-1 text-accent-primary font-semibold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Selesai
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                                                match.winner_team_id === match.team1_id ? 'bg-accent-primary/10 border border-accent-primary/30 text-white font-bold' : 'text-slate-300 bg-slate-950/60'
                                            }`}>
                                                <span className="text-xs truncate pr-2">{match.team1?.name}</span>
                                                <span className="font-mono text-base font-black text-accent-primary">{match.team1_set1_score ?? '-'}</span>
                                            </div>
                                            <div className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                                                match.winner_team_id === match.team2_id ? 'bg-accent-primary/10 border border-accent-primary/30 text-white font-bold' : 'text-slate-300 bg-slate-950/60'
                                            }`}>
                                                <span className="text-xs truncate pr-2">{match.team2?.name}</span>
                                                <span className="font-mono text-base font-black text-accent-primary">{match.team2_set1_score ?? '-'}</span>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {match.round_name}
                                            </span>
                                            <button
                                                onClick={() => setSelectedMatchModal(match)}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-accent-primary hover:underline"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Detail Match
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. TAB LEADERBOARD (Per Grup vs Lintas Grup, Full Stats) */}
                {activeTab === 'standings' && (
                    <div className="space-y-6">
                        {/* Sub-view switcher & Category Selector */}
                        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                            {/* Category Selector Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {tournament.categories.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCategoryId(c.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                            selectedCategoryId === c.id
                                                ? 'bg-accent-primary text-slate-950 shadow-md shadow-accent-primary/20 font-black'
                                                : 'bg-slate-900 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>

                            {/* View Mode Toggle: Per Grup vs Lintas Grup */}
                            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
                                <button
                                    onClick={() => setStandingsViewMode('by_group')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        standingsViewMode === 'by_group'
                                            ? 'bg-accent-primary text-slate-950 font-black shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Per Grup
                                </button>
                                <button
                                    onClick={() => setStandingsViewMode('cross_group')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        standingsViewMode === 'cross_group'
                                            ? 'bg-accent-primary text-slate-950 font-black shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Lintas Grup
                                </button>
                            </div>
                        </div>

                        {/* Standings View */}
                        {groupLetters.length === 0 ? (
                            <div className="text-center py-16 text-xs text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                                Belum ada data klasemen untuk kategori ini.
                            </div>
                        ) : standingsViewMode === 'by_group' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {groupLetters.map((groupLetter) => {
                                    const rows = currentCategoryStandings[groupLetter] || [];
                                    return (
                                        <div key={groupLetter} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                            <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                                                <h4 className="font-bold text-white text-sm">Grup {groupLetter}</h4>
                                                <span className="text-[10px] text-accent-primary font-bold">Top 2 Kualifikasi Knockout</span>
                                            </div>
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40 text-[11px]">
                                                        <th className="py-2.5 px-3 text-center">No</th>
                                                        <th className="py-2.5 px-3">Tim</th>
                                                        <th className="py-2.5 px-2 text-center" title="Played">P</th>
                                                        <th className="py-2.5 px-2 text-center" title="Won">W</th>
                                                        <th className="py-2.5 px-2 text-center" title="Lost">L</th>
                                                        <th className="py-2.5 px-2 text-center" title="Won Points">WP</th>
                                                        <th className="py-2.5 px-2 text-center" title="Lost Points">LP</th>
                                                        <th className="py-2.5 px-2 text-center font-bold" title="Ratio">RATIO</th>
                                                        <th className="py-2.5 px-3 text-center font-black text-accent-primary">PTS</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60">
                                                    {rows.map((row: any, idx: number) => (
                                                        <tr key={row.team_id} className={idx < 2 ? 'bg-accent-primary/5' : ''}>
                                                            <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                                            <td className="py-2.5 px-3 font-semibold text-slate-200">{row.team_name}</td>
                                                            <td className="py-2.5 px-2 text-center text-slate-400">{row.played}</td>
                                                            <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">{row.won}</td>
                                                            <td className="py-2.5 px-2 text-center text-rose-400">{row.lost}</td>
                                                            <td className="py-2.5 px-2 text-center text-slate-400">{row.games_won || 0}</td>
                                                            <td className="py-2.5 px-2 text-center text-slate-400">{row.games_lost || 0}</td>
                                                            <td className="py-2.5 px-2 text-center font-bold text-slate-300">
                                                                {row.game_diff > 0 ? `+${row.game_diff}` : row.game_diff}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-center font-black text-accent-primary text-sm">{row.points}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Cross Group Table */
                            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                                    <h4 className="font-bold text-white text-sm">Klasemen Keseluruhan Lintas Grup</h4>
                                    <span className="text-[10px] text-slate-400">Peringkat Gabungan Semua Tim</span>
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40 text-[11px]">
                                            <th className="py-2.5 px-3 text-center">No</th>
                                            <th className="py-2.5 px-3">Tim</th>
                                            <th className="py-2.5 px-2 text-center">Grup</th>
                                            <th className="py-2.5 px-2 text-center" title="Played">P</th>
                                            <th className="py-2.5 px-2 text-center" title="Won">W</th>
                                            <th className="py-2.5 px-2 text-center" title="Lost">L</th>
                                            <th className="py-2.5 px-2 text-center" title="Won Points">WP</th>
                                            <th className="py-2.5 px-2 text-center" title="Lost Points">LP</th>
                                            <th className="py-2.5 px-2 text-center font-bold" title="Ratio">RATIO</th>
                                            <th className="py-2.5 px-3 text-center font-black text-accent-primary">PTS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {crossGroupStandings.map((row: any, idx: number) => (
                                            <tr key={row.team_id} className={idx < 4 ? 'bg-accent-primary/5' : ''}>
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                                <td className="py-2.5 px-3 font-semibold text-slate-200">{row.team_name}</td>
                                                <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-400">Grup {row.group_letter}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{row.played}</td>
                                                <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">{row.won}</td>
                                                <td className="py-2.5 px-2 text-center text-rose-400">{row.lost}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{row.games_won || 0}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400">{row.games_lost || 0}</td>
                                                <td className="py-2.5 px-2 text-center font-bold text-slate-300">
                                                    {row.game_diff > 0 ? `+${row.game_diff}` : row.game_diff}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-black text-accent-primary text-sm">{row.points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 5. TAB BRACKET (With Category selector and Export Image button) */}
                {activeTab === 'bracket' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                            {/* Category Selector Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {tournament.categories.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCategoryId(c.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                            selectedCategoryId === c.id
                                                ? 'bg-accent-primary text-slate-950 shadow-md shadow-accent-primary/20 font-black'
                                                : 'bg-slate-900 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    window.print();
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2 transition"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh / Cetak Bagan
                            </button>
                        </div>

                        {currentCategoryKnockoutMatches.length === 0 ? (
                            <div className="text-center py-16 text-xs text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                                Bagan knockout belum dibuat untuk kategori ini.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentCategoryKnockoutMatches.map((m) => (
                                    <div key={m.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                                        <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                                            <span>{m.round_name}</span>
                                            <span className="font-mono text-accent-primary">Match #{m.match_number}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className={`p-2.5 rounded-xl text-xs flex items-center justify-between ${
                                                m.winner_team_id === m.team1_id ? 'bg-accent-primary/10 border border-accent-primary/30 text-white font-bold' : 'text-slate-300 bg-slate-950/60'
                                            }`}>
                                                <span className="truncate pr-2">{m.team1?.name || 'TBD'}</span>
                                                <span className="font-mono font-bold">{m.team1_set1_score ?? '-'}</span>
                                            </div>
                                            <div className={`p-2.5 rounded-xl text-xs flex items-center justify-between ${
                                                m.winner_team_id === m.team2_id ? 'bg-accent-primary/10 border border-accent-primary/30 text-white font-bold' : 'text-slate-300 bg-slate-950/60'
                                            }`}>
                                                <span className="truncate pr-2">{m.team2?.name || 'TBD'}</span>
                                                <span className="font-mono font-bold">{m.team2_set1_score ?? '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 6. TAB SLIDESHOW (Dedicated TV Launcher Tab matching Staging) */}
                {activeTab === 'slideshow' && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
                            <Tv className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white">Mode Slideshow TV Layar Penuh</h3>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                                Tampilan presentasi 16:9 yang dirancang khusus untuk monitor TV dan proyektor venue. Rotasi otomatis setiap 10 detik antara Pertandingan Berlangsung, Jadwal Berikutnya, dan Klasemen Babak Grup.
                            </p>
                        </div>
                        <div>
                            <a
                                href={route('tournaments.slideshow', tournament.slug || tournament.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent-primary text-slate-950 font-black text-sm shadow-xl shadow-accent-primary/20 hover:opacity-95 transition"
                            >
                                <Maximize2 className="w-4 h-4" />
                                Buka Slideshow Layar Penuh
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                )}

                {/* 7. TAB INFO & PANDUAN */}
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                            <h3 className="font-bold text-white text-base flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-accent-primary" />
                                Informasi Venue & Lokasi
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {tournament.venue_address || `${tournament.venue_name}, ${tournament.city_name}, ${tournament.province_name}`}
                            </p>
                        </div>
                        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                            <h3 className="font-bold text-white text-base flex items-center gap-2">
                                <Info className="w-4 h-4 text-accent-primary" />
                                Petunjuk Teknis & Regulasi
                            </h3>
                            <div 
                                className="text-xs text-slate-300 prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: tournament.registration_guide || 'Belum ada petunjuk teknis khusus.' }}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* MATCH DETAIL MODAL */}
            <AnimatePresence>
                {selectedMatchModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-accent-primary">
                                        {selectedMatchModal.category?.name} • Match #{selectedMatchModal.match_number}
                                    </span>
                                    <h3 className="font-black text-white text-base">Detail Pertandingan</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedMatchModal(null)}
                                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Team 1 */}
                                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                                    selectedMatchModal.winner_team_id === selectedMatchModal.team1_id 
                                        ? 'bg-accent-primary/10 border-accent-primary/40' 
                                        : 'bg-slate-950/60 border-slate-800'
                                }`}>
                                    <div>
                                        <div className="font-bold text-white text-sm">
                                            {selectedMatchModal.team1?.name}
                                        </div>
                                        {selectedMatchModal.team1?.players && selectedMatchModal.team1.players.length > 0 && (
                                            <div className="text-[11px] text-slate-400">
                                                {selectedMatchModal.team1.players.map(p => p.name).join(' • ')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-mono text-2xl font-black text-accent-primary">
                                        {selectedMatchModal.team1_set1_score ?? '-'}
                                    </div>
                                </div>

                                {/* Team 2 */}
                                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                                    selectedMatchModal.winner_team_id === selectedMatchModal.team2_id 
                                        ? 'bg-accent-primary/10 border-accent-primary/40' 
                                        : 'bg-slate-950/60 border-slate-800'
                                }`}>
                                    <div>
                                        <div className="font-bold text-white text-sm">
                                            {selectedMatchModal.team2?.name}
                                        </div>
                                        {selectedMatchModal.team2?.players && selectedMatchModal.team2.players.length > 0 && (
                                            <div className="text-[11px] text-slate-400">
                                                {selectedMatchModal.team2.players.map(p => p.name).join(' • ')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-mono text-2xl font-black text-accent-primary">
                                        {selectedMatchModal.team2_set1_score ?? '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Match Meta Information */}
                            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800 text-slate-400">
                                <div>
                                    <span className="text-[10px] uppercase text-slate-500 block">Babak</span>
                                    <span className="font-semibold text-slate-200">{selectedMatchModal.round_name}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-slate-500 block">Lapangan</span>
                                    <span className="font-semibold text-slate-200">{selectedMatchModal.court?.name || 'TBD'}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating WhatsApp Support Button */}
            <FloatingWhatsApp />

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
