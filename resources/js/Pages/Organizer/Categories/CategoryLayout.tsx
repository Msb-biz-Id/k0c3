import React from 'react';
import { Link } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    Settings, 
    Users, 
    Calendar, 
    BarChart3, 
    GitMerge, 
    ArrowLeft, 
    Trophy,
    Layers
} from 'lucide-react';

interface Props {
    tournament: {
        id: string;
        name: string;
        status: string;
    };
    category: {
        id: string;
        name: string;
        tier_name?: string;
        division_name?: string;
        skill_level_name?: string;
        format: string;
    };
    activeSubTab: 'configure' | 'teams' | 'matches' | 'groups' | 'bracket' | 'rules';
    children: React.ReactNode;
}

export default function CategoryLayout({ tournament, category, activeSubTab, children }: Props) {
    const tabs = [
        { id: 'configure', label: 'Konfigurasi Format', icon: Settings, href: route('organizer.categories.configure', [tournament.id, category.id]) },
        { id: 'teams', label: 'Tim & Undian', icon: Users, href: route('organizer.categories.teams', [tournament.id, category.id]) },
        { id: 'matches', label: 'Jadwal Match', icon: Calendar, href: route('organizer.categories.matches', [tournament.id, category.id]) },
        { id: 'groups', label: 'Klasemen Grup', icon: BarChart3, href: route('organizer.categories.groups', [tournament.id, category.id]) },
        { id: 'bracket', label: 'Bagan Knockout', icon: GitMerge, href: route('organizer.categories.bracket', [tournament.id, category.id]) },
        { id: 'rules', label: 'Rulebook & Regulasi', icon: Layers, href: route('organizer.categories.rules', [tournament.id, category.id]) },
    ];

    return (
        <OrganizerLayout>
            <div className="space-y-6 pb-16">
                {/* Breadcrumbs & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <Link href={route('organizer.tournaments.index')} className="hover:text-white transition">
                                Turnamen
                            </Link>
                            <span>/</span>
                            <Link href={route('organizer.tournaments.show', tournament.id)} className="hover:text-white transition line-clamp-1">
                                {tournament.name}
                            </Link>
                            <span>/</span>
                            <span className="text-lime-400 font-bold">{category.name}</span>
                        </div>

                        <div className="flex items-center space-x-3 pt-1">
                            <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                                <Trophy className="w-6 h-6 text-lime-400" />
                                <span>{category.name}</span>
                            </h1>

                            <div className="flex items-center space-x-1.5">
                                {category.tier_name && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-400/10 text-lime-400 border border-lime-400/20">
                                        {category.tier_name}
                                    </span>
                                )}
                                {category.division_name && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-400/10 text-sky-400 border border-sky-400/20">
                                        {category.division_name}
                                    </span>
                                )}
                                {category.skill_level_name && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-400/10 text-purple-400 border border-purple-400/20">
                                        {category.skill_level_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Link
                        href={route('organizer.tournaments.show', tournament.id)}
                        className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Operasional Turnamen</span>
                    </Link>
                </div>

                {/* Sub-Tab Navigation Bar */}
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeSubTab === tab.id;

                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                    isActive
                                        ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/10'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Main Tab Content */}
                <div>
                    {children}
                </div>
            </div>
        </OrganizerLayout>
    );
}
