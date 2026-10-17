import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    Trophy, 
    Calendar, 
    MapPin, 
    Layers, 
    Activity, 
    Users, 
    Share2, 
    ExternalLink, 
    CheckCircle2, 
    Key, 
    Copy, 
    ArrowLeft,
    Check,
    Image as ImageIcon,
    ShieldCheck,
    CreditCard,
    Clock,
    Tv,
    Settings,
    BarChart3,
    GitMerge,
    BookOpen,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface TournamentCategory {
    id: string;
    name: string;
    tier_name?: string;
    division_name?: string;
    skill_level_name?: string;
    max_teams: number;
    registration_fee: number;
    format: string;
    is_open_registration: boolean;
    teams?: any[];
}

interface CourtItem {
    id: string;
    name: string;
    surface_type: string;
    referee_token: string;
    referee_pin: string;
    is_active: boolean;
}

interface TournamentImage {
    id: string;
    image_path: string;
    is_featured: boolean;
    sort_order: number;
}

interface Props {
    tournament: {
        id: string;
        name: string;
        slug: string;
        sport_type: string;
        description?: string;
        venue_name: string;
        venue_address?: string;
        city_name?: string;
        province_name?: string;
        google_maps_url?: string;
        start_date: string;
        end_date: string;
        status: 'draft' | 'published' | 'ongoing' | 'completed';
        bank_name: string;
        bank_account_number: string;
        bank_account_holder: string;
        featured_image?: {
            image_path: string;
        };
        images: TournamentImage[];
        categories: TournamentCategory[];
        courts: CourtItem[];
    };
    stats: {
        totalCategories: number;
        totalCourts: number;
        totalTeams: number;
        verifiedTeams: number;
    };
}

export default function TournamentShow({ tournament, stats }: Props) {
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'categories' | 'courts' | 'gallery' | 'info'>('categories');

    const handleCopyRefereeLink = (token: string) => {
        const url = `${window.location.origin}/referee/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedToken(token);
        toast.success('Link wasit berhasil disalin ke clipboard!');
        setTimeout(() => setCopiedToken(null), 3000);
    };

    const handlePublish = () => {
        router.patch(route('organizer.tournaments.publish', tournament.id), {}, {
            onSuccess: () => toast.success('Turnamen berhasil dipublikasikan ke publik!'),
        });
    };

    return (
        <OrganizerLayout>
            <Head title={`${tournament.name} - Pusat Kontrol Turnamen`} />

            <div className="space-y-8 pb-16">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('organizer.tournaments.index')}
                        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Daftar Turnamen</span>
                    </Link>

                    <div className="flex items-center space-x-3">
                        {tournament.status === 'draft' ? (
                            <button
                                onClick={handlePublish}
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition shadow-lg shadow-lime-400/20 active:scale-95"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Publikasikan Turnamen</span>
                            </button>
                        ) : (
                            <Link
                                href={`/tournaments/${tournament.id}`}
                                target="_blank"
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 text-xs font-bold transition"
                            >
                                <span>Lihat Halaman Publik</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Hero Summary Card */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-900/60 border border-slate-800/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        {/* Poster Thumbnail */}
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 flex-shrink-0 shadow-lg">
                            {tournament.featured_image?.image_path ? (
                                <img
                                    src={tournament.featured_image.image_path}
                                    alt={tournament.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <Trophy className="w-10 h-10 text-lime-400/30" />
                                </div>
                            )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    tournament.status === 'published'
                                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                        : tournament.status === 'ongoing'
                                        ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30 animate-pulse'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                    {tournament.status}
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                    {tournament.sport_type}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                {tournament.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                                <div className="flex items-center space-x-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-lime-400" />
                                    <span>{tournament.venue_name}{tournament.city_name ? `, ${tournament.city_name}` : ''}</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                                    <span>{tournament.start_date} s/d {tournament.end_date}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Metric Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                            <div className="text-[11px] font-bold uppercase text-slate-400">Kategori</div>
                            <div className="text-xl font-black text-lime-400 mt-0.5">{stats.totalCategories}</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                            <div className="text-[11px] font-bold uppercase text-slate-400">Lapangan</div>
                            <div className="text-xl font-black text-sky-400 mt-0.5">{stats.totalCourts}</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                            <div className="text-[11px] font-bold uppercase text-slate-400">Total Tim</div>
                            <div className="text-xl font-black text-white mt-0.5">{stats.totalTeams}</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                            <div className="text-[11px] font-bold uppercase text-slate-400">Terverifikasi</div>
                            <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.verifiedTeams}</div>
                        </div>
                    </div>
                </div>

                {/* 7 Core Operational Hub Launchers */}
                <div className="space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Menu Operasional Pertandingan & Lapangan
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                        <Link
                            href={route('organizer.tournaments.court-control', tournament.id)}
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-lime-400/50 hover:bg-slate-900 transition flex flex-col justify-between space-y-2 group shadow-lg"
                        >
                            <div className="w-8 h-8 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center group-hover:scale-110 transition">
                                <Activity className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white group-hover:text-lime-400 transition">Court Control</div>
                                <div className="text-[10px] text-slate-400">Live Desk Lapangan</div>
                            </div>
                        </Link>

                        <Link
                            href={route('organizer.tournaments.schedule', tournament.id)}
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-400/50 hover:bg-slate-900 transition flex flex-col justify-between space-y-2 group shadow-lg"
                        >
                            <div className="w-8 h-8 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white group-hover:text-sky-400 transition">Matriks Jadwal</div>
                                <div className="text-[10px] text-slate-400">Plot Waktu & Lapangan</div>
                            </div>
                        </Link>

                        <Link
                            href={route('organizer.tournaments.registrations', tournament.id)}
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-400/50 hover:bg-slate-900 transition flex flex-col justify-between space-y-2 group shadow-lg"
                        >
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white group-hover:text-emerald-400 transition">Pendaftar & Tim</div>
                                <div className="text-[10px] text-slate-400">8 Status Verifikasi</div>
                            </div>
                        </Link>

                        <Link
                            href={route('organizer.tournaments.check-in', tournament.id)}
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-400/50 hover:bg-slate-900 transition flex flex-col justify-between space-y-2 group shadow-lg"
                        >
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white group-hover:text-purple-400 transition">Check-In Kasir</div>
                                <div className="text-[10px] text-slate-400">Kehadiran Hari-H</div>
                            </div>
                        </Link>

                        <Link
                            href={route('organizer.tournaments.courts', tournament.id)}
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-900 transition flex flex-col justify-between space-y-2 group shadow-lg"
                        >
                            <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                                <Key className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white group-hover:text-amber-400 transition">Akses Wasit</div>
                                <div className="text-[10px] text-slate-400">PIN & Lembar QR</div>
                            </div>
                        </Link>

                        <Link
                            href={route('organizer.tournaments.score-logs', tournament.id)}
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-400/50 hover:bg-slate-900 transition flex flex-col justify-between space-y-2 group shadow-lg"
                        >
                            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white group-hover:text-rose-400 transition">Audit Log Skor</div>
                                <div className="text-[10px] text-slate-400">Riwayat Perubahan</div>
                            </div>
                        </Link>

                        <Link
                            href={`/tournaments/${tournament.slug}/slideshow`}
                            target="_blank"
                            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-400/50 hover:bg-slate-900 transition flex flex-col justify-between space-y-2 group shadow-lg"
                        >
                            <div className="w-8 h-8 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
                                <Tv className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white group-hover:text-sky-400 transition">TV Slideshow</div>
                                <div className="text-[10px] text-slate-400">Live Skor Layar Panggung</div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Sub-Tab Navigation Bar */}
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                            activeTab === 'categories'
                                ? 'bg-lime-400 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        <span>Kategori Pertandingan ({tournament.categories.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('courts')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                            activeTab === 'courts'
                                ? 'bg-lime-400 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Activity className="w-4 h-4" />
                        <span>Akses Wasit & Lapangan ({tournament.courts.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                            activeTab === 'gallery'
                                ? 'bg-lime-400 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span>Galeri Media ({tournament.images.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                            activeTab === 'info'
                                ? 'bg-lime-400 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>Info Finansial & Rekening</span>
                    </button>
                </div>

                {/* Tab 1: Kategori Pertandingan */}
                {activeTab === 'categories' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {tournament.categories.map((cat, idx) => (
                                <div
                                    key={cat.id}
                                    className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-black text-white text-base">{cat.name}</div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            cat.is_open_registration ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                            {cat.is_open_registration ? 'REGISTRATION OPEN' : 'REGISTRATION CLOSED'}
                                        </span>
                                    </div>

                                    {/* Snapshots Badges */}
                                    <div className="flex flex-wrap gap-1.5 text-xs">
                                        {cat.tier_name && (
                                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-lime-300 font-semibold text-[11px]">
                                                Tier: {cat.tier_name}
                                            </span>
                                        )}
                                        {cat.division_name && (
                                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 font-semibold text-[11px]">
                                                Divisi: {cat.division_name}
                                            </span>
                                        )}
                                        {cat.skill_level_name && (
                                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 font-semibold text-[11px]">
                                                Level: {cat.skill_level_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quota & Fee */}
                                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                                        <div>
                                            Kuota: <strong>{cat.teams?.length || 0} / {cat.max_teams} Tim</strong>
                                        </div>
                                        <div className="font-mono font-bold text-lime-400">
                                            Rp {Number(cat.registration_fee).toLocaleString('id-ID')}
                                        </div>
                                    </div>

                                    {/* Match Engine Sub-Actions */}
                                    <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-1.5 text-[10px]">
                                        <Link
                                            href={route('organizer.categories.configure', [tournament.id, cat.id])}
                                            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-center border border-slate-800 transition truncate"
                                        >
                                            Format
                                        </Link>
                                        <Link
                                            href={route('organizer.categories.teams', [tournament.id, cat.id])}
                                            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-center border border-slate-800 transition truncate"
                                        >
                                            Undian Tim
                                        </Link>
                                        <Link
                                            href={route('organizer.categories.matches', [tournament.id, cat.id])}
                                            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-center border border-slate-800 transition truncate"
                                        >
                                            Jadwal
                                        </Link>
                                        <Link
                                            href={route('organizer.categories.groups', [tournament.id, cat.id])}
                                            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-center border border-slate-800 transition truncate"
                                        >
                                            Klasemen
                                        </Link>
                                        <Link
                                            href={route('organizer.categories.bracket', [tournament.id, cat.id])}
                                            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-center border border-slate-800 transition truncate"
                                        >
                                            Bracket
                                        </Link>
                                        <Link
                                            href={route('organizer.categories.rules', [tournament.id, cat.id])}
                                            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-center border border-slate-800 transition truncate"
                                        >
                                            Rulebook
                                        </Link>
                                    </div>

                                    <Link
                                        href={route('organizer.categories.configure', [tournament.id, cat.id])}
                                        className="w-full inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition shadow"
                                    >
                                        <span>Buka Match Engine Kategori</span>
                                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab 2: Akses Wasit & Lapangan */}
                {activeTab === 'courts' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-lime-400/10 border border-lime-400/20 text-xs text-lime-300 flex items-center space-x-2.5">
                            <Key className="w-4 h-4 flex-shrink-0" />
                            <span>
                                <strong>Akses Wasit Mandiri:</strong> Wasit dapat mengoperasikan skor lapangan langsung dari smartphone tanpa perlu login akun panitia. Bagikan tautan token rahasia di bawah ini kepada wasit lapangan terkait.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tournament.courts.map(court => (
                                <div
                                    key={court.id}
                                    className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2.5">
                                            <Activity className="w-4 h-4 text-lime-400" />
                                            <h3 className="font-bold text-white text-sm">{court.name}</h3>
                                        </div>
                                        <span className="text-[11px] font-mono text-slate-500 uppercase">
                                            {court.surface_type}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Token Wasit:</span>
                                            <span className="font-mono font-bold text-lime-400 text-sm tracking-wider">
                                                {court.referee_token}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">PIN Akses:</span>
                                            <span className="font-mono font-bold text-slate-200">
                                                {court.referee_pin}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleCopyRefereeLink(court.referee_token)}
                                        className="w-full inline-flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                                    >
                                        {copiedToken === court.referee_token ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-lime-400" />
                                                <span className="text-lime-400">Tautan Disalin!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Salin Link Wasit Lapangan</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab 3: Galeri Media */}
                {activeTab === 'gallery' && (
                    <div className="space-y-4">
                        {tournament.images.length === 0 ? (
                            <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs">
                                Belum ada foto pendukung yang diunggah ke galeri turnamen ini.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {tournament.images.map(img => (
                                    <div
                                        key={img.id}
                                        className="h-44 rounded-2xl overflow-hidden border border-slate-800 relative group bg-slate-950"
                                    >
                                        <img src={img.image_path} alt="Galeri" className="w-full h-full object-cover" />
                                        {img.is_featured && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-lime-400 text-slate-950">
                                                POSTER UTAMA
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 4: Info Rekening & Lokasi */}
                {activeTab === 'info' && (
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6 max-w-2xl">
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-lime-400">
                                Rekening Penarikan Dana EO
                            </h3>
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Bank:</span>
                                    <span className="font-bold text-white uppercase">{tournament.bank_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nomor Rekening:</span>
                                    <span className="font-mono font-bold text-slate-200">{tournament.bank_account_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Pemilik Rekening:</span>
                                    <span className="font-medium text-slate-200">{tournament.bank_account_holder}</span>
                                </div>
                            </div>
                        </div>

                        {tournament.venue_address && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">
                                    Alamat Venue
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    {tournament.venue_address}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </OrganizerLayout>
    );
}
