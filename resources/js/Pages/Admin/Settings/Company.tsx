import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Globe, 
    Building2, 
    Sliders, 
    Handshake, 
    Search, 
    Upload, 
    Save, 
    Plus, 
    Trash2, 
    Edit2, 
    CheckCircle2, 
    XCircle, 
    ExternalLink, 
    Eye, 
    Sparkles, 
    Smartphone, 
    Mail, 
    MapPin, 
    Share2, 
    Layers,
    Check,
    X,
    Palette,
    Type,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { applyPlatformTheme, applyTypographyPreset, THEME_PALETTES, TYPOGRAPHY_PRESETS } from '@/Utils/theme';

interface SocialLinks {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
}

interface SeoMeta {
    meta_title?: string;
    meta_description?: string;
    keywords?: string;
    og_image_path?: string;
    twitter_card?: string;
    google_site_verification?: string;
    google_analytics_id?: string;
}

interface LandingSections {
    tournament_badge?: string;
    tournament_title?: string;
    tournament_subtitle?: string;
    athletes_badge?: string;
    athletes_title?: string;
    athletes_subtitle?: string;
    partners_badge?: string;
    partners_title?: string;
    footer_about?: string;
    footer_copyright?: string;
}

interface CompanySettings {
    id: number;
    company_name: string;
    tagline?: string;
    about_text?: string;
    logo_light_path?: string;
    logo_dark_path?: string;
    favicon_path?: string;
    email?: string;
    phone?: string;
    whatsapp_number?: string;
    address?: string;
    google_maps_embed?: string;
    social_links?: SocialLinks;
    seo_meta?: SeoMeta;
    landing_sections?: LandingSections;
    enable_preloader?: boolean;
    base_url?: string;
    primary_color?: string;
    custom_color_hex?: string;
    typography_preset?: string;
}

interface CompanyFormData {
    company_name: string;
    base_url: string;
    tagline: string;
    about_text: string;
    email: string;
    phone: string;
    whatsapp_number: string;
    address: string;
    google_maps_embed: string;
    social_links: SocialLinks;
    landing_sections: LandingSections;
    enable_preloader: boolean;
    primary_color: string;
    custom_color_hex: string;
    typography_preset: string;
    logo_light: File | null;
    logo_dark: File | null;
    favicon: File | null;
}

interface HeroSlide {
    id: string;
    badge_text?: string;
    title: string;
    subtitle?: string;
    image_path?: string;
    cta_text?: string;
    cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    sort_order: number;
    is_active: boolean;
}

interface PartnerSlide {
    id: string;
    name: string;
    logo_path?: string;
    tier: string;
    website_url?: string;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    settings: CompanySettings;
    heroSlides: HeroSlide[];
    partnerSlides: PartnerSlide[];
}

export default function Company({ settings, heroSlides, partnerSlides }: Props) {
    const [activeTab, setActiveTab] = useState<'company' | 'hero' | 'partners' | 'sections' | 'seo'>('company');

    // 1. Company Profile Form
    const companyForm = useForm<CompanyFormData>({
        company_name: settings.company_name || '',
        base_url: settings.base_url || '',
        tagline: settings.tagline || '',
        about_text: settings.about_text || '',
        email: settings.email || '',
        phone: settings.phone || '',
        whatsapp_number: settings.whatsapp_number || '',
        address: settings.address || '',
        google_maps_embed: settings.google_maps_embed || '',
        social_links: {
            instagram: settings.social_links?.instagram || '',
            tiktok: settings.social_links?.tiktok || '',
            youtube: settings.social_links?.youtube || '',
            linkedin: settings.social_links?.linkedin || '',
            twitter: settings.social_links?.twitter || '',
            facebook: settings.social_links?.facebook || '',
        },
        landing_sections: {
            tournament_badge: settings.landing_sections?.tournament_badge || '',
            tournament_title: settings.landing_sections?.tournament_title || '',
            tournament_subtitle: settings.landing_sections?.tournament_subtitle || '',
            athletes_badge: settings.landing_sections?.athletes_badge || '',
            athletes_title: settings.landing_sections?.athletes_title || '',
            athletes_subtitle: settings.landing_sections?.athletes_subtitle || '',
            partners_badge: settings.landing_sections?.partners_badge || '',
            partners_title: settings.landing_sections?.partners_title || '',
            footer_about: settings.landing_sections?.footer_about || '',
            footer_copyright: settings.landing_sections?.footer_copyright || '',
        },
        enable_preloader: settings.enable_preloader ?? true,
        primary_color: settings.primary_color || 'lime',
        custom_color_hex: settings.custom_color_hex || '#a3e635',
        typography_preset: settings.typography_preset || 'athletic_broadcast',
        logo_light: null,
        logo_dark: null,
        favicon: null,
    });

    const handleCompanySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        companyForm.post(route('admin.company.update'), {
            headers: { 'X-HTTP-Method-Override': 'PUT' },
            onSuccess: () => toast.success('Profil perusahaan & branding berhasil disimpan'),
            onError: () => toast.error('Gagal memperbarui profil perusahaan. Periksa inputan.'),
        });
    };

    // 2. SEO Form
    const seoForm = useForm({
        meta_title: settings.seo_meta?.meta_title || '',
        meta_description: settings.seo_meta?.meta_description || '',
        keywords: settings.seo_meta?.keywords || '',
        twitter_card: settings.seo_meta?.twitter_card || 'summary_large_image',
        google_site_verification: settings.seo_meta?.google_site_verification || '',
        google_analytics_id: settings.seo_meta?.google_analytics_id || '',
        og_image: null as File | null,
    });

    const handleSeoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        seoForm.post(route('admin.company.seo.update'), {
            headers: { 'X-HTTP-Method-Override': 'PUT' },
            onSuccess: () => toast.success('Pengaturan SEO & Web Analytics berhasil disimpan'),
            onError: () => toast.error('Gagal memperbarui SEO. Periksa inputan.'),
        });
    };

    // 3. Hero Slide Modal & State
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
    const heroForm = useForm({
        badge_text: '',
        title: '',
        subtitle: '',
        cta_text: '',
        cta_link: '',
        secondary_cta_text: '',
        secondary_cta_link: '',
        sort_order: 0,
        is_active: true,
        image: null as File | null,
    });

    const openCreateHeroModal = () => {
        setEditingSlide(null);
        heroForm.reset();
        heroForm.setData({
            badge_text: 'Official Padel Tournament Network',
            title: '',
            subtitle: '',
            cta_text: 'Jelajahi Turnamen',
            cta_link: '/tournaments',
            secondary_cta_text: 'Peringkat Atlet',
            secondary_cta_link: '/leaderboard',
            sort_order: heroSlides.length + 1,
            is_active: true,
            image: null,
        });
        setIsHeroModalOpen(true);
    };

    const openEditHeroModal = (slide: HeroSlide) => {
        setEditingSlide(slide);
        heroForm.setData({
            badge_text: slide.badge_text || '',
            title: slide.title,
            subtitle: slide.subtitle || '',
            cta_text: slide.cta_text || '',
            cta_link: slide.cta_link || '',
            secondary_cta_text: slide.secondary_cta_text || '',
            secondary_cta_link: slide.secondary_cta_link || '',
            sort_order: slide.sort_order,
            is_active: slide.is_active,
            image: null,
        });
        setIsHeroModalOpen(true);
    };

    const handleHeroSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSlide) {
            heroForm.post(route('admin.company.hero.update', editingSlide.id), {
                headers: { 'X-HTTP-Method-Override': 'PUT' },
                onSuccess: () => {
                    toast.success('Hero slide berhasil diperbarui');
                    setIsHeroModalOpen(false);
                },
            });
        } else {
            heroForm.post(route('admin.company.hero.store'), {
                onSuccess: () => {
                    toast.success('Hero slide baru berhasil ditambahkan');
                    setIsHeroModalOpen(false);
                },
            });
        }
    };

    const toggleHeroStatus = (slide: HeroSlide) => {
        router.patch(route('admin.company.hero.toggle-status', slide.id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Status slide ${slide.is_active ? 'dinonaktifkan' : 'diaktifkan'}`),
        });
    };

    const deleteHeroSlide = (slide: HeroSlide) => {
        if (confirm(`Yakin ingin menghapus hero slide "${slide.title}"?`)) {
            router.delete(route('admin.company.hero.destroy', slide.id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Hero slide berhasil dihapus'),
            });
        }
    };

    // 4. Partner Slide Modal & State
    const [editingPartner, setEditingPartner] = useState<PartnerSlide | null>(null);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const partnerForm = useForm({
        name: '',
        tier: 'official_partner',
        website_url: '',
        sort_order: 0,
        is_active: true,
        logo: null as File | null,
    });

    const openCreatePartnerModal = () => {
        setEditingPartner(null);
        partnerForm.reset();
        partnerForm.setData({
            name: '',
            tier: 'official_partner',
            website_url: '',
            sort_order: partnerSlides.length + 1,
            is_active: true,
            logo: null,
        });
        setIsPartnerModalOpen(true);
    };

    const openEditPartnerModal = (partner: PartnerSlide) => {
        setEditingPartner(partner);
        partnerForm.setData({
            name: partner.name,
            tier: partner.tier,
            website_url: partner.website_url || '',
            sort_order: partner.sort_order,
            is_active: partner.is_active,
            logo: null,
        });
        setIsPartnerModalOpen(true);
    };

    const handlePartnerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPartner) {
            partnerForm.post(route('admin.company.partners.update', editingPartner.id), {
                headers: { 'X-HTTP-Method-Override': 'PUT' },
                onSuccess: () => {
                    toast.success('Mitra / Sponsor berhasil diperbarui');
                    setIsPartnerModalOpen(false);
                },
            });
        } else {
            partnerForm.post(route('admin.company.partners.store'), {
                onSuccess: () => {
                    toast.success('Mitra / Sponsor baru berhasil ditambahkan');
                    setIsPartnerModalOpen(false);
                },
            });
        }
    };

    const togglePartnerStatus = (partner: PartnerSlide) => {
        router.patch(route('admin.company.partners.toggle-status', partner.id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Status partner ${partner.is_active ? 'dinonaktifkan' : 'diaktifkan'}`),
        });
    };

    const deletePartnerSlide = (partner: PartnerSlide) => {
        if (confirm(`Yakin ingin menghapus mitra/sponsor "${partner.name}"?`)) {
            router.delete(route('admin.company.partners.destroy', partner.id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Mitra / sponsor berhasil dihapus'),
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Profil Perusahaan, Hero & SEO - Superadmin" />

            <div className="space-y-6 max-w-7xl mx-auto pb-16">
                {/* Header Banner */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white flex items-center gap-2">
                                Profil Perusahaan, Hero & SEO Global
                            </h1>
                            <p className="text-xs text-slate-400 mt-1">
                                Kelola identitas platform, slider banner beranda, logo sponsor mitra, dan optimasi mesin pencari secara 100% dinamis.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                            activeTab === 'company'
                                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        Profil & Kontak Perusahaan
                    </button>
                    <button
                        onClick={() => setActiveTab('hero')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                            activeTab === 'hero'
                                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Sliders className="w-4 h-4" />
                        Hero Carousel Slides ({heroSlides.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('partners')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                            activeTab === 'partners'
                                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Handshake className="w-4 h-4" />
                        Mitra & Sponsor ({partnerSlides.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sections')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                            activeTab === 'sections'
                                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        Teks Section Beranda
                    </button>
                    <button
                        onClick={() => setActiveTab('seo')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                            activeTab === 'seo'
                                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Search className="w-4 h-4" />
                        Global SEO & Web Analytics
                    </button>
                </div>

                {/* TAB 1: COMPANY PROFILE */}
                {activeTab === 'company' && (
                    <form onSubmit={handleCompanySubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Information */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-cyan-400" />
                                        Informasi Legal & Branding Platform
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">Nama Perusahaan / Platform *</label>
                                            <input
                                                type="text"
                                                value={companyForm.data.company_name}
                                                onChange={(e) => companyForm.setData('company_name', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                                required
                                            />
                                            {companyForm.errors.company_name && (
                                                <p className="text-xs text-rose-400">{companyForm.errors.company_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">Base URL Platform (Domain)</label>
                                            <input
                                                type="url"
                                                value={companyForm.data.base_url}
                                                onChange={(e) => companyForm.setData('base_url', e.target.value)}
                                                placeholder="https://koceevent.com"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Slogan / Tagline Resmi</label>
                                        <input
                                            type="text"
                                            value={companyForm.data.tagline}
                                            onChange={(e) => companyForm.setData('tagline', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>

                                    {/* Platform Theme Color Selector */}
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs font-bold text-white">Warna Tema Utama Platform (Theme Color)</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                Aktif: {companyForm.data.primary_color}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Pilih palet warna aksen atau masukkan kode HEX kustom. Warna ini diterapkan secara dinamis ke seluruh tombol, border aksen, dan preloader.
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                                            {Object.entries(THEME_PALETTES).map(([key, palette]) => {
                                                const isSelected = companyForm.data.primary_color === key;
                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() => {
                                                            companyForm.setData({
                                                                ...companyForm.data,
                                                                primary_color: key,
                                                                custom_color_hex: palette.color,
                                                            });
                                                            applyPlatformTheme(key, palette.color);
                                                        }}
                                                        className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition ${
                                                            isSelected
                                                                ? 'border-white bg-slate-900 text-white shadow-lg'
                                                                : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700'
                                                        }`}
                                                    >
                                                        <span
                                                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                                            style={{ backgroundColor: palette.color }}
                                                        />
                                                        <span className="truncate text-[11px] font-semibold">{palette.name.split(' ')[0]}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Dynamic Typography Engine (DESIGN.md Section 2.2) */}
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Type className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs font-bold text-white">Standar Tipografi Platform (Typography Engine)</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                Aktif: {companyForm.data.typography_preset}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Pilih kombinasi font berstandar tinggi untuk headings/skor, data keterbacaan, dan stopwatch token (DESIGN.md Section 2.2).
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                            {Object.values(TYPOGRAPHY_PRESETS).map((typo) => {
                                                const isSelected = companyForm.data.typography_preset === typo.id;
                                                return (
                                                    <button
                                                        key={typo.id}
                                                        type="button"
                                                        onClick={() => {
                                                            companyForm.setData('typography_preset', typo.id);
                                                            applyTypographyPreset(typo.id);
                                                        }}
                                                        className={`p-3 rounded-xl border text-left text-xs transition ${
                                                            isSelected
                                                                ? 'border-emerald-400 bg-slate-900 text-white shadow-lg'
                                                                : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-bold text-white text-xs">{typo.name.split(':')[1]?.trim() || typo.name}</span>
                                                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 leading-snug">{typo.desc}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Tentang / Deskripsi Singkat Perusahaan</label>
                                        <textarea
                                            rows={3}
                                            value={companyForm.data.about_text}
                                            onChange={(e) => companyForm.setData('about_text', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                </div>

                                {/* Contact & Venue */}
                                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-400" />
                                        Kontak Support & Lokasi Kantor / Venue Utama
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5" />
                                                Email Resmi
                                            </label>
                                            <input
                                                type="email"
                                                value={companyForm.data.email}
                                                onChange={(e) => companyForm.setData('email', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                                <Smartphone className="w-3.5 h-3.5" />
                                                Nomor Telepon
                                            </label>
                                            <input
                                                type="text"
                                                value={companyForm.data.phone}
                                                onChange={(e) => companyForm.setData('phone', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 text-emerald-400">
                                                <Smartphone className="w-3.5 h-3.5" />
                                                WhatsApp CS / Panitia
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="6281234567890"
                                                value={companyForm.data.whatsapp_number}
                                                onChange={(e) => companyForm.setData('whatsapp_number', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Alamat Lengkap</label>
                                        <textarea
                                            rows={2}
                                            value={companyForm.data.address}
                                            onChange={(e) => companyForm.setData('address', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Google Maps Embed iframe URL / HTML</label>
                                        <input
                                            type="text"
                                            value={companyForm.data.google_maps_embed}
                                            onChange={(e) => companyForm.setData('google_maps_embed', e.target.value)}
                                            placeholder="https://www.google.com/maps/embed?..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0 font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                        <Share2 className="w-4 h-4 text-violet-400" />
                                        Tautan Media Sosial Resmi
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">Instagram URL</label>
                                            <input
                                                type="url"
                                                value={companyForm.data.social_links.instagram}
                                                onChange={(e) => companyForm.setData('social_links', { ...companyForm.data.social_links, instagram: e.target.value })}
                                                placeholder="https://instagram.com/padelgigs"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">TikTok URL</label>
                                            <input
                                                type="url"
                                                value={companyForm.data.social_links.tiktok}
                                                onChange={(e) => companyForm.setData('social_links', { ...companyForm.data.social_links, tiktok: e.target.value })}
                                                placeholder="https://tiktok.com/@padelgigs"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">YouTube Channel URL</label>
                                            <input
                                                type="url"
                                                value={companyForm.data.social_links.youtube}
                                                onChange={(e) => companyForm.setData('social_links', { ...companyForm.data.social_links, youtube: e.target.value })}
                                                placeholder="https://youtube.com/@padelgigs"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">LinkedIn Company URL</label>
                                            <input
                                                type="url"
                                                value={companyForm.data.social_links.linkedin}
                                                onChange={(e) => companyForm.setData('social_links', { ...companyForm.data.social_links, linkedin: e.target.value })}
                                                placeholder="https://linkedin.com/company/padelgigs"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logos & Assets Sidebar */}
                            <div className="space-y-6">
                                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-cyan-400" />
                                        Logo & Favicon
                                    </h3>

                                    {/* Logo Dark Mode */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400 block">Logo Mode Gelap (Default)</label>
                                        <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                                            {settings.logo_dark_path ? (
                                                <img
                                                    src={`/storage/${settings.logo_dark_path}`}
                                                    alt="Logo Dark"
                                                    className="max-h-12 object-contain"
                                                />
                                            ) : (
                                                <div className="text-xs text-slate-500 font-mono">Belum ada logo dark</div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => companyForm.setData('logo_dark', e.target.files?.[0] || null)}
                                                className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Logo Light Mode */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400 block">Logo Mode Terang</label>
                                        <div className="p-4 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-2">
                                            {settings.logo_light_path ? (
                                                <img
                                                    src={`/storage/${settings.logo_light_path}`}
                                                    alt="Logo Light"
                                                    className="max-h-12 object-contain"
                                                />
                                            ) : (
                                                <div className="text-xs text-slate-500 font-mono">Belum ada logo light</div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => companyForm.setData('logo_light', e.target.files?.[0] || null)}
                                                className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300"
                                            />
                                        </div>
                                    </div>

                                    {/* Favicon */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400 block">Favicon (.ico, .png, .svg)</label>
                                        <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-800 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {settings.favicon_path ? (
                                                    <img
                                                        src={`/storage/${settings.favicon_path}`}
                                                        alt="Favicon"
                                                        className="w-8 h-8 object-contain rounded-lg bg-slate-900 p-1"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                                        ICO
                                                    </div>
                                                )}
                                                <span className="text-xs text-slate-400">Favicon Browser</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*,.ico"
                                                onChange={(e) => companyForm.setData('favicon', e.target.files?.[0] || null)}
                                                className="text-xs text-slate-400 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 w-32"
                                            />
                                        </div>
                                    </div>

                                    {/* Preloader SVG Animation Control */}
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs font-bold text-white">Preloader Animasi SVG</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => companyForm.setData('enable_preloader', !companyForm.data.enable_preloader)}
                                                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
                                                    companyForm.data.enable_preloader ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                                                }`}
                                            >
                                                <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition" />
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Menampilkan splash screen animasi SVG logo dinamis saat halaman pertama kali dibuka oleh pengunjung.
                                        </p>
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                                            <span className="text-[10px] text-slate-500 font-mono">Status Sistem:</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                companyForm.data.enable_preloader ? 'text-emerald-400' : 'text-slate-500'
                                            }`}>
                                                {companyForm.data.enable_preloader ? 'Aktif (ON)' : 'Nonaktif (OFF)'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={companyForm.processing}
                                        className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {companyForm.processing ? 'Menyimpan...' : 'Simpan Profil Perusahaan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {/* TAB 2: HERO CAROUSEL SLIDES */}
                {activeTab === 'hero' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white">Daftar Slider Banner Beranda</h3>
                                <p className="text-xs text-slate-400">
                                    Urutan banner dirotasi secara dinamis di halaman depan platform.
                                </p>
                            </div>
                            <button
                                onClick={openCreateHeroModal}
                                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Hero Slide
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {heroSlides.map((slide) => (
                                <div
                                    key={slide.id}
                                    className={`bg-slate-900/60 border rounded-3xl overflow-hidden transition flex flex-col justify-between ${
                                        slide.is_active ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
                                    }`}
                                >
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                                Urutan: #{slide.sort_order}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleHeroStatus(slide)}
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                                                        slide.is_active
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                                                    }`}
                                                >
                                                    {slide.is_active ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Aktif
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3" />
                                                            Nonaktif
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {slide.badge_text && (
                                            <div className="inline-block px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                                                {slide.badge_text}
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-lg font-bold text-white line-clamp-2">{slide.title}</h4>
                                            {slide.subtitle && (
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                                                    {slide.subtitle}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {slide.cta_text && (
                                                <span className="text-[11px] px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                                                    CTA 1: {slide.cta_text} ({slide.cta_link || '#'})
                                                </span>
                                            )}
                                            {slide.secondary_cta_text && (
                                                <span className="text-[11px] px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                                                    CTA 2: {slide.secondary_cta_text} ({slide.secondary_cta_link || '#'})
                                                </span>
                                            )}
                                        </div>

                                        {slide.image_path && (
                                            <div className="mt-3 rounded-2xl overflow-hidden h-36 bg-slate-950 border border-slate-800">
                                                <img
                                                    src={`/storage/${slide.image_path}`}
                                                    alt={slide.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEditHeroModal(slide)}
                                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteHeroSlide(slide)}
                                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition border border-rose-500/20"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {heroSlides.length === 0 && (
                                <div className="col-span-2 text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
                                    <Sliders className="w-10 h-10 text-slate-600 mx-auto" />
                                    <h4 className="text-sm font-bold text-white">Belum Ada Hero Slide</h4>
                                    <p className="text-xs text-slate-500">
                                        Klik tombol "Tambah Hero Slide" di atas untuk menambahkan slide pertama.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: SPONSORS & PARTNERS */}
                {activeTab === 'partners' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white">Daftar Logo Mitra & Sponsor</h3>
                                <p className="text-xs text-slate-400">
                                    Logo brand apparel, raket, bola, atau venue partner yang tampil di footer & banner beranda.
                                </p>
                            </div>
                            <button
                                onClick={openCreatePartnerModal}
                                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Mitra / Sponsor
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {partnerSlides.map((partner) => (
                                <div
                                    key={partner.id}
                                    className={`bg-slate-900/60 border rounded-3xl p-5 flex flex-col justify-between transition ${
                                        partner.is_active ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                                #{partner.sort_order}
                                            </span>
                                            <button
                                                onClick={() => togglePartnerStatus(partner)}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    partner.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                                }`}
                                            >
                                                {partner.is_active ? 'Aktif' : 'Off'}
                                            </button>
                                        </div>

                                        <div className="h-20 bg-slate-950/80 rounded-2xl flex items-center justify-center p-3 border border-slate-800/80">
                                            {partner.logo_path ? (
                                                <img
                                                    src={`/storage/${partner.logo_path}`}
                                                    alt={partner.name}
                                                    className="max-h-full max-w-full object-contain filter brightness-90 hover:brightness-100 transition"
                                                />
                                            ) : (
                                                <span className="text-sm font-black text-slate-300">{partner.name}</span>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-white truncate">{partner.name}</h4>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mt-0.5">
                                                {partner.tier.replace('_', ' ')}
                                            </span>
                                        </div>

                                        {partner.website_url && (
                                            <a
                                                href={partner.website_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 truncate"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                {partner.website_url.replace('https://', '')}
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-800">
                                        <button
                                            onClick={() => openEditPartnerModal(partner)}
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => deletePartnerSlide(partner)}
                                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {partnerSlides.length === 0 && (
                                <div className="col-span-full text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
                                    <Handshake className="w-10 h-10 text-slate-600 mx-auto" />
                                    <h4 className="text-sm font-bold text-white">Belum Ada Mitra / Sponsor</h4>
                                    <p className="text-xs text-slate-500">
                                        Klik tombol "Tambah Mitra / Sponsor" untuk mengunggah logo partner.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: LANDING SECTIONS CUSTOMIZATION */}
                {activeTab === 'sections' && (
                    <form onSubmit={handleCompanySubmit} className="space-y-6">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-cyan-400" />
                                    Kustomisasi Teks Section Beranda & Footer
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Atur seluruh judul, subjudul, dan teks deskripsi yang tampil di beranda tanpa ada teks yang di-hardcode.
                                </p>
                            </div>

                            {/* Section 1: Direktori Turnamen */}
                            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                    1. Section Direktori Jadwal Turnamen
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Badge Pill Teks</label>
                                        <input
                                            type="text"
                                            value={companyForm.data.landing_sections.tournament_badge}
                                            onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, tournament_badge: e.target.value })}
                                            placeholder="Jadwal Turnamen Resmi"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Judul Utama Section *</label>
                                        <input
                                            type="text"
                                            value={companyForm.data.landing_sections.tournament_title}
                                            onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, tournament_title: e.target.value })}
                                            placeholder="Jadwal Turnamen Padel"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Subjudul Deskripsi</label>
                                    <textarea
                                        rows={2}
                                        value={companyForm.data.landing_sections.tournament_subtitle}
                                        onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, tournament_subtitle: e.target.value })}
                                        placeholder="Pilih kategori, daftar bersama pasangan tanding, dan pantau jalannya skor secara live."
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    />
                                </div>
                            </div>

                            {/* Section 2: Hall of Fame Atlet */}
                            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                                    2. Section Hall of Fame Atlet & Pemain
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Badge Pill Teks</label>
                                        <input
                                            type="text"
                                            value={companyForm.data.landing_sections.athletes_badge}
                                            onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, athletes_badge: e.target.value })}
                                            placeholder="Padel Hall of Fame"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Judul Utama Section *</label>
                                        <input
                                            type="text"
                                            value={companyForm.data.landing_sections.athletes_title}
                                            onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, athletes_title: e.target.value })}
                                            placeholder="Top Atlet & Pemain Padel Pilihan"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Subjudul Deskripsi</label>
                                    <textarea
                                        rows={2}
                                        value={companyForm.data.landing_sections.athletes_subtitle}
                                        onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, athletes_subtitle: e.target.value })}
                                        placeholder="Peringkat atlet padel teratas berdasarkan performa turnamen."
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    />
                                </div>
                            </div>

                            {/* Section 3: Mitra & Sponsor */}
                            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                                    3. Section Mitra & Brand Sponsor
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Badge Pill Teks</label>
                                        <input
                                            type="text"
                                            value={companyForm.data.landing_sections.partners_badge}
                                            onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, partners_badge: e.target.value })}
                                            placeholder="Official Network"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Judul Baris Sponsor *</label>
                                        <input
                                            type="text"
                                            value={companyForm.data.landing_sections.partners_title}
                                            onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, partners_title: e.target.value })}
                                            placeholder="Mitra & Brand Sponsor Resmi Turnamen Padel"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Footer About & Copyright */}
                            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                    4. Footer Deskripsi Singkat & Copyright
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Teks Bio Singkat Footer</label>
                                        <textarea
                                            rows={2}
                                            value={companyForm.data.landing_sections.footer_about}
                                            onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, footer_about: e.target.value })}
                                            placeholder="Solusi Ekosistem Turnamen Padel Terlengkap di Indonesia."
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Teks Copyright (Tambahan)</label>
                                        <input
                                            type="text"
                                            value={companyForm.data.landing_sections.footer_copyright}
                                            onChange={(e) => companyForm.setData('landing_sections', { ...companyForm.data.landing_sections, footer_copyright: e.target.value })}
                                            placeholder="All rights reserved."
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={companyForm.processing}
                                className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {companyForm.processing ? 'Menyimpan...' : 'Simpan Kustomisasi Teks Section Beranda'}
                            </button>
                        </div>
                    </form>
                )}

                {/* TAB 4: GLOBAL SEO & ANALYTICS */}
                {activeTab === 'seo' && (
                    <form onSubmit={handleSeoSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Search Engine Preview */}
                                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-cyan-400" />
                                        Live Google SERP Snippet Preview
                                    </h3>

                                    {/* Google SERP Mockup Box */}
                                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 font-sans">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-400 font-bold">
                                                {(companyForm.data.company_name || 'K').charAt(0).toUpperCase()}
                                            </div>
                                            <span>{companyForm.data.base_url || 'https://koceevent.com'}</span>
                                            <span>&rsaquo; turnamen</span>
                                        </div>
                                        <div className="text-base text-cyan-400 font-medium hover:underline cursor-pointer line-clamp-1">
                                            {seoForm.data.meta_title || `${companyForm.data.company_name || 'Koceevent'} - Platform Turnamen & Event Olahraga`}
                                        </div>
                                        <div className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                                            {seoForm.data.meta_description || 'Platform resmi kejuaraan dan turnamen. Skor real-time wasit, undian grup terisolasi, dan bagan sistem gugur otomatis.'}
                                        </div>
                                    </div>

                                    {/* SEO Form Inputs */}
                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <label className="font-medium text-slate-300">Global Meta Title Template *</label>
                                                <span className={`font-mono text-[11px] ${
                                                    seoForm.data.meta_title.length > 60 ? 'text-amber-400' : 'text-slate-500'
                                                }`}>
                                                    {seoForm.data.meta_title.length}/60 karakter ideal
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={seoForm.data.meta_title}
                                                onChange={(e) => seoForm.setData('meta_title', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <label className="font-medium text-slate-300">Global Meta Description *</label>
                                                <span className={`font-mono text-[11px] ${
                                                    seoForm.data.meta_description.length > 160 ? 'text-amber-400' : 'text-slate-500'
                                                }`}>
                                                    {seoForm.data.meta_description.length}/160 karakter ideal
                                                </span>
                                            </div>
                                            <textarea
                                                rows={3}
                                                value={seoForm.data.meta_description}
                                                onChange={(e) => seoForm.setData('meta_description', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-300">Target Keywords (Pisahkan dengan koma)</label>
                                            <input
                                                type="text"
                                                value={seoForm.data.keywords}
                                                onChange={(e) => seoForm.setData('keywords', e.target.value)}
                                                placeholder="padel indonesia, turnamen padel, live score padel, jadwal padel"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Web Analytics & Verification */}
                                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-400" />
                                        Verifikasi Mesin Pencari & Web Analytics
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">Google Site Verification Token</label>
                                            <input
                                                type="text"
                                                value={seoForm.data.google_site_verification}
                                                onChange={(e) => seoForm.setData('google_site_verification', e.target.value)}
                                                placeholder="google-site-verification=xxxx..."
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0 font-mono text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">Google Analytics 4 (GA4) ID / GTM ID</label>
                                            <input
                                                type="text"
                                                value={seoForm.data.google_analytics_id}
                                                onChange={(e) => seoForm.setData('google_analytics_id', e.target.value)}
                                                placeholder="G-XXXXXXXXXX"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media Sharing & OG Image */}
                            <div className="space-y-6">
                                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                        <Share2 className="w-4 h-4 text-cyan-400" />
                                        OpenGraph Social Banner
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400 block">
                                            OG Image (1200x630 px untuk WhatsApp & Medsos)
                                        </label>
                                        <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                                            {settings.seo_meta?.og_image_path ? (
                                                <img
                                                    src={`/storage/${settings.seo_meta.og_image_path}`}
                                                    alt="OG Banner"
                                                    className="w-full h-32 object-cover rounded-xl"
                                                />
                                            ) : (
                                                <div className="text-xs text-slate-500 font-mono">Belum ada OG Image banner</div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => seoForm.setData('og_image', e.target.files?.[0] || null)}
                                                className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Twitter Card Style</label>
                                        <select
                                            value={seoForm.data.twitter_card}
                                            onChange={(e) => seoForm.setData('twitter_card', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                        >
                                            <option value="summary_large_image">Summary Large Image (Disarankan)</option>
                                            <option value="summary">Summary Small Box</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={seoForm.processing}
                                        className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {seoForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan SEO'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* HERO SLIDE MODAL */}
            {isHeroModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-cyan-400" />
                                {editingSlide ? 'Edit Hero Slide' : 'Tambah Hero Slide Baru'}
                            </h3>
                            <button
                                onClick={() => setIsHeroModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleHeroSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Badge Text (Pill Atas)</label>
                                    <input
                                        type="text"
                                        value={heroForm.data.badge_text}
                                        onChange={(e) => heroForm.setData('badge_text', e.target.value)}
                                        placeholder="Turnamen Nasional 2026"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Urutan (Sort Order)</label>
                                    <input
                                        type="number"
                                        value={heroForm.data.sort_order}
                                        onChange={(e) => heroForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">Headline Title *</label>
                                <input
                                    type="text"
                                    value={heroForm.data.title}
                                    onChange={(e) => heroForm.setData('title', e.target.value)}
                                    placeholder="Temukan Turnamen & Taklukkan Padel Court"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">Subtitle Deskripsi</label>
                                <textarea
                                    rows={2}
                                    value={heroForm.data.subtitle}
                                    onChange={(e) => heroForm.setData('subtitle', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Teks Tombol CTA Utama</label>
                                    <input
                                        type="text"
                                        value={heroForm.data.cta_text}
                                        onChange={(e) => heroForm.setData('cta_text', e.target.value)}
                                        placeholder="Jelajahi Turnamen"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Link URL Tombol CTA Utama</label>
                                    <input
                                        type="text"
                                        value={heroForm.data.cta_link}
                                        onChange={(e) => heroForm.setData('cta_link', e.target.value)}
                                        placeholder="/tournaments"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Teks Tombol CTA Sekunder</label>
                                    <input
                                        type="text"
                                        value={heroForm.data.secondary_cta_text}
                                        onChange={(e) => heroForm.setData('secondary_cta_text', e.target.value)}
                                        placeholder="Peringkat Atlet"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Link URL CTA Sekunder</label>
                                    <input
                                        type="text"
                                        value={heroForm.data.secondary_cta_link}
                                        onChange={(e) => heroForm.setData('secondary_cta_link', e.target.value)}
                                        placeholder="/leaderboard"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">Gambar Banner Slide (Opsional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => heroForm.setData('image', e.target.files?.[0] || null)}
                                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 w-full"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="hero_is_active"
                                    checked={heroForm.data.is_active}
                                    onChange={(e) => heroForm.setData('is_active', e.target.checked)}
                                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                                />
                                <label htmlFor="hero_is_active" className="text-xs text-slate-300 font-medium">
                                    Aktifkan dan tampilkan slide ini di halaman utama
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsHeroModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={heroForm.processing}
                                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                                >
                                    {heroForm.processing ? 'Menyimpan...' : 'Simpan Slide'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PARTNER / SPONSOR MODAL */}
            {isPartnerModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Handshake className="w-4 h-4 text-cyan-400" />
                                {editingPartner ? 'Edit Mitra / Sponsor' : 'Tambah Mitra / Sponsor'}
                            </h3>
                            <button
                                onClick={() => setIsPartnerModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handlePartnerSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">Nama Brand / Sponsor *</label>
                                <input
                                    type="text"
                                    value={partnerForm.data.name}
                                    onChange={(e) => partnerForm.setData('name', e.target.value)}
                                    placeholder="Bullpadel, Babolat, Wilson, dll."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Tier / Kategori Kemitraan *</label>
                                    <select
                                        value={partnerForm.data.tier}
                                        onChange={(e) => partnerForm.setData('tier', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    >
                                        <option value="official_partner">Official Partner</option>
                                        <option value="platinum">Platinum Sponsor</option>
                                        <option value="gold">Gold Sponsor</option>
                                        <option value="silver">Silver Sponsor</option>
                                        <option value="official_ball">Official Ball</option>
                                        <option value="official_racket">Official Racket</option>
                                        <option value="official_apparel">Official Apparel</option>
                                        <option value="venue_partner">Venue Partner</option>
                                        <option value="media_partner">Media Partner</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Urutan (Sort Order)</label>
                                    <input
                                        type="number"
                                        value={partnerForm.data.sort_order}
                                        onChange={(e) => partnerForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">Website URL Brand</label>
                                <input
                                    type="url"
                                    value={partnerForm.data.website_url}
                                    onChange={(e) => partnerForm.setData('website_url', e.target.value)}
                                    placeholder="https://bullpadel.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-0"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">Logo Sponsor (PNG / SVG Transparan disarankan)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => partnerForm.setData('logo', e.target.files?.[0] || null)}
                                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 w-full"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="partner_is_active"
                                    checked={partnerForm.data.is_active}
                                    onChange={(e) => partnerForm.setData('is_active', e.target.checked)}
                                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                                />
                                <label htmlFor="partner_is_active" className="text-xs text-slate-300 font-medium">
                                    Aktifkan sponsor ini di tampilan beranda & footer
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsPartnerModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={partnerForm.processing}
                                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                                >
                                    {partnerForm.processing ? 'Menyimpan...' : 'Simpan Mitra'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
