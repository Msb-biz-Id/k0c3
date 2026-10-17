import React from 'react';
import { Handshake } from 'lucide-react';

export interface PartnerSlide {
    id: string;
    name: string;
    logo_path?: string;
    tier: string;
    website_url?: string;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    partners: PartnerSlide[];
    badgeText?: string;
    sectionTitle?: string;
}

export default function PartnerMarquee({
    partners,
    badgeText,
    sectionTitle,
}: Props) {
    const activePartners = (Array.isArray(partners) ? partners : []).filter((p) => p && p.is_active);

    if (activePartners.length === 0) {
        return null;
    }

    return (
        <section className="border-y border-slate-800/80 bg-slate-900/40 py-8 px-6">
            <div className="max-w-7xl mx-auto space-y-4">
                {(badgeText || sectionTitle) && (
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Handshake className="w-4 h-4 text-emerald-400" />
                            {sectionTitle || 'Mitra & Brand Sponsor Resmi'}
                        </span>
                        {badgeText && (
                            <span className="text-[10px] text-slate-500 font-mono">
                                {badgeText}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
                    {activePartners.map((partner) => (
                        <a
                            key={partner.id}
                            href={partner.website_url || '#'}
                            target={partner.website_url ? '_blank' : '_self'}
                            rel="noreferrer"
                            className="shrink-0 group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition"
                        >
                            {partner.logo_path ? (
                                <img
                                    src={`/storage/${partner.logo_path}`}
                                    alt={partner.name}
                                    className="h-8 max-w-[100px] object-contain filter grayscale group-hover:grayscale-0 transition"
                                />
                            ) : (
                                <span className="text-sm font-black text-slate-300 group-hover:text-emerald-400 transition">
                                    {partner.name}
                                </span>
                            )}
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                {partner.tier.replace(/_/g, ' ')}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
