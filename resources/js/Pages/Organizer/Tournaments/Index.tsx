import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    Trophy, 
    PlusCircle, 
    Calendar, 
    MapPin, 
    Search, 
    ArrowRight,
    Layers,
    Activity,
    CheckCircle2
} from 'lucide-react';

interface TournamentItem {
    id: string;
    name: string;
    slug: string;
    sport_type: string;
    venue_name: string;
    city_name: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'published' | 'ongoing' | 'completed';
    categories_count: number;
    courts_count: number;
    featured_image?: {
        image_path: string;
    };
}

interface Props {
    tournaments: {
        data: TournamentItem[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function TournamentIndex({ tournaments, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('organizer.tournaments.index'), { search, status: statusFilter }, { preserveState: true });
    };

    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        router.get(route('organizer.tournaments.index'), { search, status }, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PUBLISHED</span>
                    </span>
                );
            case 'ongoing':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-lime-400/15 text-lime-400 border border-lime-400/30">
                        <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                        <span>ONGOING</span>
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        SELESAI
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        DRAFT
                    </span>
                );
        }
    };

    return (
        <OrganizerLayout>
            <Head title="Turnamen Saya - Event Organizer" />

            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
                        <Trophy className="w-6 h-6 text-lime-400" />
                        <span>Turnamen Saya</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Pusat kendali seluruh turnamen padel dan tenis yang Anda kelola.
                    </p>
                </div>

                <Link
                    href={route('organizer.tournaments.create')}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm transition shadow-lg shadow-lime-400/20 active:scale-95"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Buat Turnamen Baru</span>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                {/* Status Chips */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {[
                        { label: 'Semua Status', value: '' },
                        { label: 'Draft', value: 'draft' },
                        { label: 'Published', value: 'published' },
                        { label: 'Sedang Main', value: 'ongoing' },
                        { label: 'Selesai', value: 'completed' },
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => handleStatusChange(tab.value)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                statusFilter === tab.value
                                    ? 'bg-lime-400 text-slate-950 shadow-md font-bold'
                                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari turnamen / venue..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition"
                    />
                </form>
            </div>

            {/* Tournaments Grid */}
            {tournaments.data.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-lime-400/10 border border-lime-400/20 text-lime-400 flex items-center justify-center mx-auto">
                        <Trophy className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h3 className="text-base font-bold text-white">Belum Ada Turnamen</h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Mulai perjalanan Anda sebagai penyelenggara turnamen dengan membuat event padel pertama Anda.
                        </p>
                    </div>
                    <Link
                        href={route('organizer.tournaments.create')}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition shadow-lg shadow-lime-400/10"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Buat Turnamen Sekarang</span>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.data.map(item => (
                        <div
                            key={item.id}
                            className="group bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 flex flex-col"
                        >
                            {/* Poster Header */}
                            <div className="h-44 relative bg-slate-950 overflow-hidden">
                                {item.featured_image?.image_path ? (
                                    <img
                                        src={item.featured_image.image_path}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-lime-950/40 flex items-center justify-center">
                                        <Trophy className="w-12 h-12 text-slate-800 group-hover:text-lime-400/30 transition duration-300" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    {getStatusBadge(item.status)}
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-lime-400 border border-lime-400/30">
                                        {item.sport_type}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-base text-white group-hover:text-lime-300 transition line-clamp-1">
                                        {item.name}
                                    </h3>

                                    <div className="space-y-1 text-xs text-slate-400">
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                            <span className="line-clamp-1">{item.venue_name}{item.city_name ? `, ${item.city_name}` : ''}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                            <span>{item.start_date} s/d {item.end_date}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Summary */}
                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
                                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                                        <Layers className="w-3.5 h-3.5 text-lime-400" />
                                        <span><strong>{item.categories_count}</strong> Kategori</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                                        <Activity className="w-3.5 h-3.5 text-sky-400" />
                                        <span><strong>{item.courts_count}</strong> Lapangan</span>
                                    </div>
                                </div>

                                {/* Card Footer CTA */}
                                <div className="pt-2">
                                    <Link
                                        href={route('organizer.tournaments.show', item.id)}
                                        className="w-full inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 group-hover:bg-lime-400 group-hover:text-slate-950 text-slate-200 font-bold text-xs transition duration-200 shadow"
                                    >
                                        <span>Kelola Turnamen</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </OrganizerLayout>
    );
}
