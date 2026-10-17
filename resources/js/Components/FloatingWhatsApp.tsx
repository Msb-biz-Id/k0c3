import React from 'react';
import { usePage } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
    const { company } = usePage().props as any;
    const rawNumber = company?.whatsapp_number || '6281234567890';
    // Format sanitized number without +, space, or dashes
    const phoneNumber = rawNumber.replace(/[^0-9]/g, '');
    const companyName = company?.company_name || 'Koceevent';
    const message = encodeURIComponent(`Halo Tim ${companyName}, saya ingin bertanya tentang turnamen dan registrasi.`);

    return (
        <aside
            aria-label="Bantuan WhatsApp"
            className="fixed bottom-20 md:bottom-6 right-6 z-40 flex items-center group"
        >
            <span className="hidden md:inline-block mr-3 rounded-xl border border-emerald-500/30 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-emerald-400 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                Butuh bantuan panitia? Chat Kami
            </span>
            <a
                href={`https://wa.me/${phoneNumber}?text=${message}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Hubungi Panitia via WhatsApp"
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all"
            >
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25" />
                <MessageCircle className="h-6 w-6 fill-current relative z-10" />
            </a>
        </aside>
    );
}
