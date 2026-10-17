import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    Calendar, 
    MapPin, 
    Radio, 
    ChevronRight,
    Award
} from 'lucide-react';
import { motion } from 'motion/react';
import MobileBottomNav from '@/Components/MobileBottomNav';
import CommandPalette from '@/Components/CommandPalette';
import FloatingWhatsApp from '@/Components/FloatingWhatsApp';
import LandingHeader from '@/Components/Landing/LandingHeader';
import LandingFooter from '@/Components/Landing/LandingFooter';
import HeroSection, { HeroSlide } from '@/Components/Landing/HeroSection';
import PartnerMarquee, { PartnerSlide } from '@/Components/Landing/PartnerMarquee';

interface TournamentImage {
    id: string;
    image_path: string;
    is_featured: boolean;
}

interface Category {
    id: string;
    name: string;
    tier_name?: string;
    division_name?: string;
    skill_level_name?: string;
    max_teams: number;
    registration_fee: number;
}

interface Tournament {
    id: string;
    name: string;
    slug: string;
    venue_name: string;
    city_name: string;
    province_name: string;
    start_date: string;
    end_date: string;
    status: string;
    featured_image?: TournamentImage;
    images?: TournamentImage[];
    categories: Category[];
}

interface LiveMatch {
    id: string;
    round_name: string;
    match_number: number;
    team1_set1_score?: number;
    team2_set1_score?: number;
    current_game_score?: string;
    server_team?: number;
    team1?: { name: string };
    team2?: { name: string };
    court?: { name: string; tournament?: { name: string; slug: string } };
    category?: { name: string };
}

interface Athlete {
    id: number;
    name: string;
    city_name?: string;
    play_hand?: string;
    skill_level_name?: string;
    profile_photo_url?: string;
}

interface Props {
    auth: { user?: any };
    tournaments: {
        data: Tournament[];
        links: any[];
        total: number;
    };
    liveMatches: LiveMatch[];
    topAthletes: Athlete[];
    heroSlides?: HeroSlide[];
    partnerSlides?: PartnerSlide[];
    filters: {
        search?: string;
        city?: string;
        province?: string;
    };
}

export default function Welcome({ 
    auth, 
    tournaments, 
    liveMatches, 
    topAthletes, 
    heroSlides = [], 
    partnerSlides = [], 
    filters 
}: Props) {
    const { company } = usePage().props as any;

    const [search, setSearch] = useState(filters.search || '');
    const [provinces, setProvinces] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState(filters.province || '');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    useEffect(() => {
        fetch('/api/regions/provinces')
            .then(res => res.json())
            .then(json => {
                const list = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
                setProvinces(list);
            })
            .catch(() => {
                setProvinces([]);
            });
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('home'), {
            search: search || undefined,
            province: selectedProvince || undefined,
        }, { preserveState: true });
    };

    // Dynamic SEO values
    const metaTitle = company?.seo_meta?.meta_title || company?.company_name || 'Tournament Platform';
    const metaDescription = company?.seo_meta?.meta_description || company?.tagline || '';
    const metaKeywords = company?.seo_meta?.keywords || '';
    const ogImage = company?.seo_meta?.og_image_path ? `/storage/${company.seo_meta.og_image_path}` : undefined;
    const faviconUrl = company?.favicon_path ? `/storage/${company.favicon_path}` : '/favicon.ico';

    // Dynamic Section Text
    const sections = company?.landing_sections || {};
    const tournamentTitle = sections.tournament_title || 'Jadwal Turnamen';
    const tournamentSubtitle = sections.tournament_subtitle || '';
    const athletesBadge = sections.athletes_badge || 'Hall of Fame';
    const athletesTitle = sections.athletes_title || 'Top Atlet & Pemain';
    const athletesSubtitle = sections.athletes_subtitle || '';
    const partnersBadge = sections.partners_badge || '';
    const partnersTitle = sections.partners_title || 'Mitra & Brand Sponsor';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
            {/* Dynamic SEO Meta Headers */}
            <Head>
                <title>{metaTitle}</title>
                {metaDescription && <meta name="description" content={metaDescription} />}
                {metaKeywords && <meta name="keywords" content={metaKeywords} />}
                <link rel="icon" type="image/x-icon" href={faviconUrl} />
                {ogImage && <meta property="og:image" content={ogImage} />}
                <meta property="og:title" content={metaTitle} />
                {metaDescription && <meta property="og:description" content={metaDescription} />}
                <meta name="twitter:card" content={company?.seo_meta?.twitter_card || 'summary_large_image'} />
                {company?.seo_meta?.google_site_verification && (
                    <meta name="google-site-verification" content={company.seo_meta.google_site_verification} />
                )}
            </Head>

            {/* Global Search Modal */}
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

            {/* Modular Dynamic Header */}
            <LandingHeader
                company={company}
                auth={auth}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />

            {/* LIVE MATCH STADIUM RADAR TICKER */}
            {Array.isArray(liveMatches) && liveMatches.length > 0 && (
                <div id="live-radar" className="bg-slate-900/90 border-b border-emerald-500/20 py-2.5 px-4 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto flex items-center gap-4">
                        <div className="flex items-center gap-2 shrink-0 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <Radio className="w-3.5 h-3.5" />
                            Live Radar
                        </div>

                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 text-xs text-slate-300">
                            {liveMatches.map((match) => (
                                <Link
                                    key={match.id}
                                    href={match.court?.tournament?.slug ? route('tournaments.show', match.court.tournament.slug) : '#'}
                                    className="flex items-center gap-3 shrink-0 px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition"
                                >
                                    <span className="text-slate-500 font-mono text-[11px]">{match.court?.name}:</span>
                                    <span className="font-semibold text-white">{match.team1?.name}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black font-mono">
                                        {match.team1_set1_score ?? 0} - {match.team2_set1_score ?? 0}
                                    </span>
                                    <span className="font-semibold text-white">{match.team2?.name}</span>
                                    {match.current_game_score && (
                                        <span className="text-[10px] text-amber-400 font-bold">({match.current_game_score})</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modular Dynamic Hero Section */}
            <HeroSection
                slides={Array.isArray(heroSlides) ? heroSlides : []}
                search={search}
                onSearchChange={setSearch}
                selectedProvince={selectedProvince}
                onProvinceChange={setSelectedProvince}
                provinces={provinces}
                onSearchSubmit={handleSearchSubmit}
            />

            {/* Modular Dynamic Partner Marquee */}
            <PartnerMarquee
                partners={Array.isArray(partnerSlides) ? partnerSlides : []}
                badgeText={partnersBadge}
                sectionTitle={partnersTitle}
            />

            {/* TOURNAMENT DIRECTORY SECTION */}
            <section id="tournaments" className="max-w-7xl mx-auto px-6 py-12 space-y-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                            <Trophy className="w-6 h-6 text-emerald-400" />
                            {tournamentTitle} ({tournaments.total})
                        </h2>
                        {tournamentSubtitle && (
                            <p className="text-sm text-slate-400 mt-1">
                                {tournamentSubtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Tournament Cards Grid */}
                {tournaments.data.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
                        <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                        <h3 className="text-lg font-bold text-white">Tidak Ada Turnamen Ditemukan</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Coba ubah kata kunci pencarian atau reset filter provinsi.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.data.map((t) => (
                            <motion.div
                                key={t.id}
                                whileHover={{ y: -4 }}
                                className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
                            >
                                <div>
                                    {/* Thumbnail Image Banner */}
                                    <div className="h-48 bg-slate-950 relative overflow-hidden">
                                        {t.featured_image ? (
                                            <img
                                                src={`/storage/${t.featured_image.image_path}`}
                                                alt={t.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-600 space-y-2">
                                                <Trophy className="w-10 h-10 text-slate-700" />
                                                <span className="text-xs font-semibold">{company?.company_name || 'Tournament Arena'}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                                        
                                        {/* Status badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-md ${
                                                t.status === 'ongoing' 
                                                    ? 'bg-emerald-500/80 text-white' 
                                                    : 'bg-slate-900/80 text-slate-300 border border-slate-700'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </div>

                                        {/* Venue & City Chip */}
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                                            <span className="flex items-center gap-1 font-semibold truncate bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-md">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                {t.venue_name || t.city_name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tournament Body Details */}
                                    <div className="p-5 space-y-4">
                                        <div>
                                            <h3 className="text-lg font-black text-white hover:text-emerald-400 transition line-clamp-1">
                                                <Link href={route('tournaments.show', t.slug || t.id)}>
                                                    {t.name}
                                                </Link>
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{new Date(t.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(t.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        {/* Category Pills */}
                                        <div className="space-y-1.5">
                                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kategori Tersedia:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(Array.isArray(t.categories) ? t.categories : []).map((c) => (
                                                    <span 
                                                        key={c.id} 
                                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                                                    >
                                                        {c.name}
                                                    </span>
                                                ))}
                                                {(!t.categories || t.categories.length === 0) && (
                                                    <span className="text-xs text-slate-500">Belum ada kategori</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Action */}
                                <div className="p-5 pt-0">
                                    <Link
                                        href={route('tournaments.show', t.slug || t.id)}
                                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                                    >
                                        Buka Turnamen & Live Score
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* HALL OF FAME TOP ATHLETES */}
            <section id="athletes" className="bg-slate-900/40 border-t border-slate-800/80 py-16 px-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        {athletesBadge && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-wider">
                                <Award className="w-3.5 h-3.5" />
                                {athletesBadge}
                            </div>
                        )}
                        <h2 className="text-2xl font-black text-white">{athletesTitle}</h2>
                        {athletesSubtitle && (
                            <p className="text-xs text-slate-400 max-w-lg mx-auto">
                                {athletesSubtitle}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {(Array.isArray(topAthletes) ? topAthletes : []).map((athlete, idx) => (
                            <div 
                                key={athlete.id} 
                                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center space-y-4 hover:border-slate-700 transition"
                            >
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5">
                                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-black text-white">
                                            {athlete.name.charAt(0)}
                                        </div>
                                    </div>
                                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg">
                                        #{idx + 1}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-base font-bold text-white">{athlete.name}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {athlete.city_name || ''} {athlete.play_hand ? `• ${athlete.play_hand} Hand` : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modular Dynamic Footer */}
            <LandingFooter company={company} />

            {/* Floating WhatsApp Support Button */}
            <FloatingWhatsApp />

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
