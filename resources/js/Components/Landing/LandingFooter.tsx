import React from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Mail, Phone, Video, Globe } from 'lucide-react';

interface Props {
    company?: {
        company_name?: string;
        tagline?: string;
        about_text?: string;
        logo_dark_path?: string;
        address?: string;
        email?: string;
        phone?: string;
        social_links?: {
            instagram?: string;
            tiktok?: string;
            youtube?: string;
            linkedin?: string;
            twitter?: string;
            facebook?: string;
        };
        landing_sections?: {
            footer_about?: string;
            footer_copyright?: string;
        };
    };
}

export default function LandingFooter({ company }: Props) {
    const brandName = company?.company_name || 'Koceevent';
    const aboutText = company?.about_text || company?.landing_sections?.footer_about;
    const copyrightText = company?.landing_sections?.footer_copyright || 'All rights reserved.';

    return (
        <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-6 mb-14 md:mb-0">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* Column 1: Brand & About */}
                <div className="space-y-3 md:col-span-2">
                    <div className="flex items-center gap-3">
                        {company?.logo_dark_path ? (
                            <img
                                src={`/storage/${company.logo_dark_path}`}
                                alt={brandName}
                                className="h-8 w-auto object-contain"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                {brandName.charAt(0)}
                            </div>
                        )}
                        <span className="text-lg font-black text-white">
                            {brandName}
                        </span>
                    </div>

                    {aboutText && (
                        <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                            {aboutText}
                        </p>
                    )}

                    {company?.address && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            {company.address}
                        </p>
                    )}
                </div>

                {/* Column 2: Navigation Links */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigasi Platform</h4>
                    <ul className="space-y-2 text-xs text-slate-400">
                        <li><Link href="/tournaments" className="hover:text-emerald-400 transition">Jadwal Turnamen</Link></li>
                        <li><Link href="/leaderboard" className="hover:text-emerald-400 transition">Peringkat & Klasemen Atlet</Link></li>
                        <li><Link href="/winners" className="hover:text-emerald-400 transition">Hall of Fame Juara</Link></li>
                        <li><Link href="/blog" className="hover:text-emerald-400 transition">Berita & Panduan</Link></li>
                    </ul>
                </div>

                {/* Column 3: Contact & Socials */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Kontak & Media Sosial</h4>
                    <div className="space-y-1.5 text-xs text-slate-400">
                        {company?.email && (
                            <p className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                                <a href={`mailto:${company.email}`} className="hover:text-white transition">{company.email}</a>
                            </p>
                        )}
                        {company?.phone && (
                            <p className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{company.phone}</span>
                            </p>
                        )}
                    </div>

                    {/* Social Media Links */}
                    {company?.social_links && (
                        <div className="flex items-center gap-2 pt-2">
                            {company.social_links.instagram && (
                                <a
                                    href={company.social_links.instagram}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition"
                                    title="Instagram"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                </a>
                            )}
                            {company.social_links.tiktok && (
                                <a
                                    href={company.social_links.tiktok}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition"
                                    title="TikTok"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                                </a>
                            )}
                            {company.social_links.youtube && (
                                <a
                                    href={company.social_links.youtube}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition"
                                    title="YouTube"
                                >
                                    <Video className="w-4 h-4" />
                                </a>
                            )}
                            {company.social_links.linkedin && (
                                <a
                                    href={company.social_links.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition"
                                    title="LinkedIn"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} {brandName}. {copyrightText}</p>
                {company?.tagline && (
                    <p className="text-[11px] font-mono">{company.tagline}</p>
                )}
            </div>
        </footer>
    );
}
