import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    User, 
    Trophy, 
    Activity, 
    Award, 
    ArrowLeft, 
    Calendar, 
    MapPin, 
    ShieldCheck, 
    CheckCircle2,
    TrendingUp,
    ChevronDown,
    ArrowRight
} from 'lucide-react';
import { 
    Radar, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import MobileBottomNav from '@/Components/MobileBottomNav';
import DarkModeToggle from '@/Components/DarkModeToggle';
import FloatingWhatsApp from '@/Components/FloatingWhatsApp';

interface Player {
    id: string;
    name: string;
    city_name?: string;
    province_name?: string;
    preferred_side?: string;
    dominant_hand?: string;
    skill_level?: string;
    bio?: string;
    playtomic_rating?: number;
}

interface Stats {
    matches_played: number;
    matches_won: number;
    matches_lost: number;
    win_rate: number;
    championships_won: number;
}

interface MonthlyTrendItem {
    month: string;
    menang: number;
    kalah: number;
}

interface TournamentHistoryItem {
    id: string;
    name: string;
    slug?: string;
    date: string;
    venue: string;
    stage: string;
    type: 'public' | 'community';
}

interface Props {
    player: Player;
    stats: Stats;
    radarAttributes: { subject: string; value: number; fullMark: number }[];
    monthlyTrend: MonthlyTrendItem[];
    tournamentsJoined: TournamentHistoryItem[];
    matchHistory?: any[];
}

export default function PlayerProfileShow({ 
    player, 
    stats, 
    radarAttributes, 
    monthlyTrend, 
    tournamentsJoined 
}: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const [selectedYear, setSelectedYear] = useState('2026');
    const [tourneyTab, setTourneyTab] = useState<'public' | 'community'>('public');

    const filteredTournaments = tournamentsJoined.filter(t => t.type === tourneyTab || !t.type);

    const donutData = [
        { name: 'Menang', value: stats.matches_won, color: '#10b981' },
        { name: 'Kalah', value: stats.matches_lost, color: '#ef4444' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
            <Head title={`${player.name} — ${brandName}`} />

            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/leaderboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" />
                        Peringkat Atlet
                    </Link>

                    <div className="flex items-center gap-3">
                        <DarkModeToggle />

                        <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            VERIFIED ATHLETE
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN ATHLETE PROFILE */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
                {/* Profile Header (Centered Avatar & Name matching staging) */}
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-2xl shadow-emerald-500/20">
                        <div className="w-full h-full rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl font-black text-white">
                            {player.name ? player.name.charAt(0) : 'P'}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white">{player.name}</h1>
                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 mt-1">
                            {player.city_name && (
                                <span className="flex items-center gap-1 text-slate-300">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                    {player.city_name}
                                </span>
                            )}
                            <span>&bull;</span>
                            <span className="text-emerald-400 font-semibold">
                                {player.skill_level || 'Intermediate'}
                            </span>
                            <span>&bull;</span>
                            <span className="text-slate-300">
                                Tangan {player.dominant_hand === 'left' ? 'Kiri' : 'Kanan'} ({player.preferred_side === 'left' ? 'Sisi Kiri' : 'Sisi Kanan'})
                            </span>
                        </div>
                        {player.bio && (
                            <p className="text-xs text-slate-400 max-w-lg mx-auto pt-2">
                                {player.bio}
                            </p>
                        )}
                    </div>
                </div>

                {/* 4 CORE KPI METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1 shadow-lg">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Main</span>
                        <div className="text-3xl font-black text-white font-mono">{stats.matches_played}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1 shadow-lg">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Menang</span>
                        <div className="text-3xl font-black text-emerald-400 font-mono">{stats.matches_won}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1 shadow-lg">
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Win Rate</span>
                        <div className="text-3xl font-black text-blue-400 font-mono">{stats.win_rate}%</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1 shadow-lg">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Juara</span>
                        <div className="text-3xl font-black text-amber-400 font-mono">{stats.championships_won}</div>
                    </div>
                </div>

                {/* STATISTIK PER TAHUN SECTION (Circle Gauge & Trend Line Chart) */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-lg font-black text-white">Statistik per tahun</h2>
                            <p className="text-xs text-slate-400">Ringkasan efisiensi kemenangan dan tren performa tahunan.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:ring-emerald-500"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                        {/* Donut Gauge Win Rate */}
                        <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="relative w-44 h-44 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={55}
                                            outerRadius={75}
                                            startAngle={90}
                                            endAngle={-270}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-white font-mono">{stats.win_rate}%</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 w-full text-center border-t border-slate-800/80 pt-3">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Main</div>
                                    <div className="text-sm font-black text-white font-mono">{stats.matches_played}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-emerald-400 uppercase">Menang</div>
                                    <div className="text-sm font-black text-emerald-400 font-mono">{stats.matches_won}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-red-400 uppercase">Kalah</div>
                                    <div className="text-sm font-black text-red-400 font-mono">{stats.matches_lost}</div>
                                </div>
                            </div>
                        </div>

                        {/* Tren Performa Monthly Line Chart (2 Columns) */}
                        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    Tren performa ({selectedYear})
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-semibold">
                                    <span className="flex items-center gap-1.5 text-emerald-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                                        Menang
                                    </span>
                                    <span className="flex items-center gap-1.5 text-red-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                                        Kalah
                                    </span>
                                </div>
                            </div>

                            <div className="w-full h-48 pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                                        />
                                        <Line type="monotone" dataKey="menang" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                                        <Line type="monotone" dataKey="kalah" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5D RADAR SPIDER CHART & ATTRIBUTE BREAKDOWN */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Spider Radar Atribut Atlet 5D
                    </h3>
                    <p className="text-xs text-slate-400">
                        Visualisasi metrik kekuatan atlet meliputi Power, Agility, Serve, Volley, dan Defense.
                    </p>

                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarAttributes}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Radar name="Player" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* RIWAYAT TURNAMEN SECTION (Public vs Community Toggle Tabs) */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-lg font-black text-white">Riwayat turnamen</h2>
                            <p className="text-xs text-slate-400">Kejuaraan resmi publik dan kompetisi komunitas yang pernah diikuti.</p>
                        </div>

                        {/* Public vs Community Switcher */}
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setTourneyTab('public')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                                    tourneyTab === 'public'
                                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Public
                            </button>
                            <button
                                type="button"
                                onClick={() => setTourneyTab('community')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                                    tourneyTab === 'community'
                                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Community
                            </button>
                        </div>
                    </div>

                    {filteredTournaments.length === 0 ? (
                        <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                            Belum ada riwayat turnamen {tourneyTab === 'public' ? 'publik' : 'komunitas'}.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTournaments.map((t) => (
                                <Link
                                    key={t.id}
                                    href={t.slug ? `/tournaments/${t.slug}` : `/tournaments/${t.id}`}
                                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-4 transition group"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm sm:text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                                                {t.name}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                                                {t.stage}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                {t.date}
                                            </span>
                                            <span>&bull;</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                {t.venue}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:text-slate-950 transition">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Floating WhatsApp Support Button */}
            <FloatingWhatsApp />

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
