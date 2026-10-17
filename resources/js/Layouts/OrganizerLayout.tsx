import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Trophy, 
    PlusCircle, 
    LogOut, 
    ExternalLink,
    ArrowLeftCircle,
    ShieldAlert,
    Calendar,
    Settings,
    Layers,
    DollarSign
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export default function OrganizerLayout({ children, title }: Props) {
    const { auth, flash } = usePage().props as any;

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast.info(flash.info);
    }, [flash]);

    const handleLeaveImpersonation = () => {
        router.post(route('impersonation.leave'));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-lime-500 selection:text-slate-950">
            <Toaster position="top-right" richColors theme="dark" />

            {/* Impersonation Floating Amber Banner */}
            {auth?.is_impersonating && (
                <div className="sticky top-0 z-50 bg-amber-500/95 backdrop-blur-md text-slate-950 px-4 py-2 font-medium flex items-center justify-between shadow-lg border-b border-amber-400">
                    <div className="flex items-center space-x-2 text-sm font-semibold">
                        <ShieldAlert className="w-5 h-5 text-slate-950" />
                        <span>Mode Impersonation: Anda sedang mengelola turnamen sebagai <strong>{auth.user?.name}</strong></span>
                    </div>
                    <button
                        onClick={handleLeaveImpersonation}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 rounded-lg text-xs font-bold transition shadow"
                    >
                        <ArrowLeftCircle className="w-4 h-4" />
                        <span>Kembali ke Superadmin</span>
                    </button>
                </div>
            )}

            {/* Top Navigation Bar */}
            <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center space-x-3">
                    <Link href={route('organizer.tournaments.index')} className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-lime-400/20 border border-lime-400/30 flex items-center justify-center">
                            <span className="font-mono text-lime-400 font-black text-sm">PG</span>
                        </div>
                        <div>
                            <span className="font-extrabold text-base tracking-tight text-white">PADELGIGS</span>
                            <span className="ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-sky-400/10 text-sky-400 border border-sky-400/20">
                                EO DASHBOARD
                            </span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        href={route('organizer.tournaments.create')}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition shadow-lg shadow-lime-400/10 active:scale-95"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Buat Turnamen</span>
                    </Link>

                    <div className="h-4 w-px bg-slate-800" />

                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                    >
                        <span>Portal Publik</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <div className="h-4 w-px bg-slate-800" />

                    <div className="flex items-center space-x-3 text-sm">
                        <div className="text-right">
                            <div className="font-medium text-slate-200 text-xs">{auth?.user?.name}</div>
                            <div className="text-[11px] text-slate-400">{auth?.user?.email}</div>
                        </div>

                        <Link
                            method="post"
                            href={route('logout')}
                            as="button"
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Keluar"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar Navigation */}
                <aside className="w-60 border-r border-slate-800/80 bg-slate-900/30 p-4 space-y-6">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                            Pusat Event
                        </div>
                        <nav className="space-y-1">
                            <Link
                                href={route('organizer.tournaments.index')}
                                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition bg-lime-400/10 text-lime-400 border border-lime-400/20"
                            >
                                <Trophy className="w-4 h-4" />
                                <span>Turnamen Saya</span>
                            </Link>

                            <Link
                                href={route('organizer.tournaments.create')}
                                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/40 hover:text-white transition"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>Buat Turnamen Baru</span>
                            </Link>

                            <Link
                                href={route('organizer.income.index')}
                                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/40 hover:text-white transition"
                            >
                                <DollarSign className="w-4 h-4 text-lime-400" />
                                <span>Buku Besar Pendapatan</span>
                            </Link>
                        </nav>
                    </div>

                    {auth?.user?.roles?.includes('superadmin') && (
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 px-3 mb-2">
                                Akses Superadmin
                            </div>
                            <nav className="space-y-1">
                                <Link
                                    href={route('admin.master.index')}
                                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition bg-amber-400/10 text-amber-400 border border-amber-400/20"
                                >
                                    <Layers className="w-4 h-4" />
                                    <span>Master Data Superadmin</span>
                                </Link>
                            </nav>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
