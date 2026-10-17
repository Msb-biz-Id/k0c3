import React, { PropsWithChildren } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { User, Lock, Palette, ArrowLeft, Trophy } from 'lucide-react';

interface SettingsLayoutProps {
    title: string;
}

export default function SettingsLayout({
    title,
    children,
}: PropsWithChildren<SettingsLayoutProps>) {
    const user = usePage().props.auth.user;
    const currentUrl = usePage().url;

    const navItems = [
        {
            name: 'Profil Atlet & Info',
            href: '/settings/profile',
            icon: User,
            active: currentUrl.startsWith('/settings/profile') || currentUrl.startsWith('/profile'),
        },
        {
            name: 'Kata Sandi & Keamanan',
            href: '/settings/password',
            icon: Lock,
            active: currentUrl.startsWith('/settings/password'),
        },
        {
            name: 'Tampilan & Tema Aksen',
            href: '/settings/appearance',
            icon: Palette,
            active: currentUrl.startsWith('/settings/appearance'),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={`${title} - Pengaturan Akun`} />

            <div className="py-10 bg-slate-950 min-h-[calc(100vh-4rem)] text-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                                <Trophy className="w-4 h-4 text-emerald-400" />
                                Pengaturan Akun & Preferensi PadelGigs
                            </div>
                            <h1 className="text-3xl font-black text-white">
                                {title}
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Kelola identitas atlet, preferensi raket, keamanan sandi, dan aksen warna visual.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href={user.id ? `/players/${user.id}` : '/leaderboard'}
                                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Lihat Profil Publik
                            </Link>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-px">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                                        item.active
                                            ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
                                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Content Section */}
                    <div>{children}</div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
