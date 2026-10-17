import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Home, Trophy, Activity, Award, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function MobileBottomNav() {
    const { url } = usePage();
    const isHome = url === '/';
    const isTournament = url.startsWith('/tournaments');
    const isLeaderboard = url.startsWith('/leaderboard') || url.startsWith('/players');
    const isDashboard = url.startsWith('/dashboard') || url.startsWith('/organizer') || url.startsWith('/admin');

    const navItems = [
        {
            label: 'Home',
            icon: Home,
            href: '/',
            active: isHome,
        },
        {
            label: 'Turnamen',
            icon: Trophy,
            href: '/tournaments',
            active: isTournament,
        },
        {
            label: 'Live Match',
            icon: Activity,
            href: '/#live-radar',
            active: false,
            badge: true,
        },
        {
            label: 'Leaderboard',
            icon: Award,
            href: '/leaderboard',
            active: isLeaderboard,
        },
        {
            label: 'Akun / Desk',
            icon: User,
            href: '/dashboard',
            active: isDashboard,
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-2xl">
            <div className="grid grid-cols-5 items-center justify-around">
                {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            className={`flex flex-col items-center justify-center py-1 select-none transition-colors relative ${
                                item.active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <div className="relative">
                                <Icon className="w-5 h-5 transition-transform" />
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium tracking-tight mt-1">
                                {item.label}
                            </span>
                            {item.active && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute -bottom-1 w-5 h-0.5 bg-emerald-400 rounded-full"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
