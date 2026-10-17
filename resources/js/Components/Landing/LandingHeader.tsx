import React from 'react';
import { Link } from '@inertiajs/react';
import { Trophy, Search, LayoutDashboard } from 'lucide-react';
import DarkModeToggle from '@/Components/DarkModeToggle';

interface Props {
    company?: {
        company_name?: string;
        tagline?: string;
        logo_dark_path?: string;
    };
    auth: { user?: any };
    onOpenCommandPalette: () => void;
}

export default function LandingHeader({
    company,
    auth,
    onOpenCommandPalette,
}: Props) {
    const brandName = company?.company_name || 'Koceevent';

    return (
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        {company?.logo_dark_path ? (
                            <img
                                src={`/storage/${company.logo_dark_path}`}
                                alt={brandName}
                                className="h-9 w-auto object-contain"
                            />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary text-slate-950 font-black shadow-[0_0_15px_var(--app-accent-glow,rgba(163,230,53,0.3))] transition-transform group-hover:scale-105">
                                <Trophy className="h-5 w-5 fill-current" />
                            </div>
                        )}
                        <span className="text-xl font-black tracking-tight text-white group-hover:text-accent-primary transition-colors">
                            {brandName}
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="/tournaments" className="text-slate-300 hover:text-white transition-colors">
                            Turnamen
                        </Link>
                        <Link href="/leaderboard" className="text-slate-300 hover:text-white transition-colors">
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
                        onClick={onOpenCommandPalette}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition"
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span>Cari turnamen & atlet...</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">⌘K</kbd>
                    </button>

                    <DarkModeToggle />

                    {auth?.user ? (
                        <Link
                            href={
                                auth.user.roles?.some((r: any) => r.name === 'superadmin')
                                    ? route('admin.master.index')
                                    : auth.user.roles?.some((r: any) => r.name === 'organizer')
                                    ? route('organizer.tournaments.index')
                                    : '/settings/profile'
                            }
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 flex items-center gap-2 transition"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5 text-accent-primary" />
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
    );
}
