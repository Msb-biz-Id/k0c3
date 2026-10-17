import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Layers, 
    MessageSquare, 
    DollarSign, 
    FileText, 
    Users, 
    ShieldAlert, 
    LogOut, 
    ExternalLink,
    ArrowLeftCircle,
    Globe
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: Props) {
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
                <div className="sticky top-0 z-50 bg-amber-500/90 backdrop-blur-md text-slate-950 px-4 py-2 font-medium flex items-center justify-between shadow-lg border-b border-amber-400">
                    <div className="flex items-center space-x-2 text-sm font-semibold">
                        <ShieldAlert className="w-5 h-5 text-slate-950" />
                        <span>Anda sedang dalam Mode Impersonation sebagai: <strong>{auth.user?.name}</strong></span>
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
                    <div className="w-8 h-8 rounded-lg bg-lime-400/20 border border-lime-400/30 flex items-center justify-center">
                        <span className="font-mono text-lime-400 font-black text-sm">PG</span>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-base tracking-tight text-white">PADELGIGS</span>
                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-lime-400/10 text-lime-400 border border-lime-400/20">
                                SUPERADMIN
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
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
                <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 p-4 space-y-6">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                            Konfigurasi Inti
                        </div>
                        <nav className="space-y-1">
                            <Link
                                href={route('admin.master.index')}
                                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                                    route().current('admin.master.*')
                                        ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                }`}
                            >
                                <Layers className="w-4 h-4" />
                                <span>Master Data Dinamis</span>
                            </Link>
                            <Link
                                href={route('admin.company.index')}
                                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                                    route().current('admin.company.*')
                                        ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                }`}
                            >
                                <Globe className="w-4 h-4 text-cyan-400" />
                                <span>Profil, Hero & SEO</span>
                            </Link>
                        </nav>
                    </div>

                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                            Platform & Integrasi
                        </div>
                        <nav className="space-y-1">
                            <Link
                                href={route('admin.whatsapp.index')}
                                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                            >
                                <MessageSquare className="w-4 h-4 text-emerald-400" />
                                <span>WhatsApp sidobe.com</span>
                            </Link>
                            <Link
                                href={route('admin.payouts.index')}
                                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                            >
                                <DollarSign className="w-4 h-4 text-amber-400" />
                                <span>Penarikan Payouts</span>
                            </Link>
                            <Link
                                href={route('admin.blog.index')}
                                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                            >
                                <FileText className="w-4 h-4 text-sky-400" />
                                <span>Blog CMS Engine</span>
                            </Link>
                            <Link
                                href={route('admin.users.index')}
                                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                            >
                                <Users className="w-4 h-4 text-lime-400" />
                                <span>Pengguna & Peran (RBAC)</span>
                            </Link>
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
