import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import OrganizerLayout from '@/Layouts/OrganizerLayout';
import { 
    Trophy, 
    Upload, 
    Star, 
    Trash2, 
    Plus, 
    ArrowLeft, 
    MapPin, 
    Calendar, 
    CreditCard, 
    Layers, 
    ShieldCheck,
    Activity,
    Info
} from 'lucide-react';

interface MasterDataOption {
    id: string;
    name: string;
    slug: string;
    badge_color?: string;
    gender_restriction?: string;
    min_rating?: number;
    max_rating?: number;
}

interface RegionOption {
    id: string;
    code: string;
    name: string;
}

interface CategoryInput {
    name: string;
    tier_id: string;
    division_id: string;
    skill_level_id: string;
    max_teams: number;
    registration_fee: number;
    format: 'group_knockout' | 'knockout_only' | 'round_robin';
    is_open_registration: boolean;
}

interface CourtInput {
    name: string;
    surface_type: string;
}

interface Props {
    masterTiers: MasterDataOption[];
    masterDivisions: MasterDataOption[];
    masterSkillLevels: MasterDataOption[];
}

export default function TournamentCreate({ masterTiers, masterDivisions, masterSkillLevels }: Props) {
    // Provinces & Cities State
    const [provinces, setProvinces] = useState<RegionOption[]>([]);
    const [cities, setCities] = useState<RegionOption[]>([]);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    // Multi-image preview
    const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string }[]>([]);
    const [featuredIndex, setFeaturedIndex] = useState<number>(0);

    const form = useForm({
        name: '',
        sport_type: 'padel',
        description: '',
        venue_name: '',
        venue_address: '',
        province_id: '',
        province_name: '',
        city_id: '',
        city_name: '',
        google_maps_url: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        registration_guide: '',
        bank_name: 'BCA',
        bank_account_number: '',
        bank_account_holder: '',
        featured_image_index: 0,
        images: [] as File[],
        categories: [
            {
                name: 'Men Beginner',
                tier_id: masterTiers[0]?.id || '',
                division_id: masterDivisions[0]?.id || '',
                skill_level_id: masterSkillLevels[2]?.id || '',
                max_teams: 12,
                registration_fee: 350000,
                format: 'group_knockout',
                is_open_registration: true,
            }
        ] as CategoryInput[],
        courts: [
            { name: 'Lapangan 1', surface_type: 'panoramic_turf' },
            { name: 'Lapangan 2', surface_type: 'panoramic_turf' },
        ] as CourtInput[],
    });

    // Fetch Provinces on mount
    useEffect(() => {
        setIsLoadingProvinces(true);
        fetch('/api/regions/provinces')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setProvinces(data.data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoadingProvinces(false));
    }, []);

    // Handle Province Selection -> fetch Cities
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceCode = e.target.value;
        const selectedProv = provinces.find(p => p.code === provinceCode);

        form.setData(data => ({
            ...data,
            province_id: provinceCode,
            province_name: selectedProv ? selectedProv.name : '',
            city_id: '',
            city_name: '',
        }));

        if (!provinceCode) {
            setCities([]);
            return;
        }

        setIsLoadingCities(true);
        fetch(`/api/regions/cities/${provinceCode}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setCities(data.data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoadingCities(false));
    };

    // Handle City Selection
    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityCode = e.target.value;
        const selectedCity = cities.find(c => c.code === cityCode);

        form.setData(data => ({
            ...data,
            city_id: cityCode,
            city_name: selectedCity ? selectedCity.name : '',
        }));
    };

    // Multi-image selection
    const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);

        // Limit to 10 total
        const combined = [...imagePreviews];
        for (const file of selectedFiles) {
            if (combined.length >= 10) break;
            combined.push({
                file,
                url: URL.createObjectURL(file),
            });
        }

        setImagePreviews(combined);
        form.setData('images', combined.map(item => item.file));
    };

    const removeImage = (index: number) => {
        const updated = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(updated);
        form.setData('images', updated.map(item => item.file));

        if (featuredIndex === index) {
            setFeaturedIndex(0);
            form.setData('featured_image_index', 0);
        } else if (featuredIndex > index) {
            setFeaturedIndex(featuredIndex - 1);
            form.setData('featured_image_index', featuredIndex - 1);
        }
    };

    const setAsFeatured = (index: number) => {
        setFeaturedIndex(index);
        form.setData('featured_image_index', index);
    };

    // Dynamic Category Repeater
    const addCategory = () => {
        form.setData('categories', [
            ...form.data.categories,
            {
                name: 'Kategori Baru',
                tier_id: masterTiers[0]?.id || '',
                division_id: masterDivisions[0]?.id || '',
                skill_level_id: masterSkillLevels[0]?.id || '',
                max_teams: 12,
                registration_fee: 300000,
                format: 'group_knockout',
                is_open_registration: true,
            }
        ]);
    };

    const removeCategory = (index: number) => {
        if (form.data.categories.length <= 1) return;
        form.setData('categories', form.data.categories.filter((_, i) => i !== index));
    };

    const updateCategory = (index: number, field: keyof CategoryInput, value: any) => {
        const updated = [...form.data.categories];
        updated[index] = { ...updated[index], [field]: value };
        form.setData('categories', updated);
    };

    // Dynamic Court Repeater
    const addCourt = () => {
        form.setData('courts', [
            ...form.data.courts,
            {
                name: `Lapangan ${form.data.courts.length + 1}`,
                surface_type: 'panoramic_turf',
            }
        ]);
    };

    const removeCourt = (index: number) => {
        if (form.data.courts.length <= 1) return;
        form.setData('courts', form.data.courts.filter((_, i) => i !== index));
    };

    const updateCourt = (index: number, field: keyof CourtInput, value: string) => {
        const updated = [...form.data.courts];
        updated[index] = { ...updated[index], [field]: value };
        form.setData('courts', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('organizer.tournaments.store'), {
            forceFormData: true,
        });
    };

    return (
        <OrganizerLayout>
            <Head title="Buat Turnamen Baru" />

            <div className="max-w-4xl mx-auto space-y-8 pb-16">
                {/* Header Navigation */}
                <div className="flex items-center space-x-3">
                    <Link
                        href={route('organizer.tournaments.index')}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Buat Turnamen Baru</h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Konfigurasi informasi turnamen, galeri poster, lokasi venue, dan kategori dinamis.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 1. Multi-Image Media Gallery Section */}
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <Upload className="w-5 h-5 text-lime-400" />
                                <h2 className="text-base font-bold text-white">Galeri Foto & Poster Utama</h2>
                            </div>
                            <span className="text-xs text-slate-400">
                                {imagePreviews.length} / 10 Foto Terunggah
                            </span>
                        </div>

                        {/* Dropzone Upload */}
                        <div className="relative border-2 border-dashed border-slate-800 hover:border-lime-400/50 rounded-2xl p-6 text-center transition bg-slate-950/40">
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageFiles}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={imagePreviews.length >= 10}
                            />
                            <div className="flex flex-col items-center space-y-2 pointer-events-none">
                                <div className="w-12 h-12 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-400 flex items-center justify-center">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div className="text-sm font-semibold text-slate-200">
                                    Klik atau seret foto turnamen ke sini
                                </div>
                                <p className="text-xs text-slate-400">
                                    Mendukung hingga 10 foto (Arena, Lounge, Piala, Sponsor). Format: JPG, PNG, WebP (Maks 5MB per file).
                                </p>
                            </div>
                        </div>

                        {/* Image Previews Grid */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                                {imagePreviews.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`relative group h-28 rounded-xl overflow-hidden border-2 transition ${
                                            featuredIndex === idx
                                                ? 'border-lime-400 shadow-lg shadow-lime-400/20'
                                                : 'border-slate-800'
                                        }`}
                                    >
                                        <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                                        
                                        {/* Featured Star Button */}
                                        <button
                                            type="button"
                                            onClick={() => setAsFeatured(idx)}
                                            className={`absolute top-1.5 left-1.5 p-1 rounded-lg backdrop-blur-md transition ${
                                                featuredIndex === idx
                                                    ? 'bg-amber-500 text-slate-950'
                                                    : 'bg-slate-950/70 text-slate-400 hover:text-amber-400'
                                            }`}
                                            title={featuredIndex === idx ? 'Poster Utama' : 'Jadikan Poster Utama'}
                                        >
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                        </button>

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-950/70 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                                            title="Hapus Foto"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        {featuredIndex === idx && (
                                            <div className="absolute bottom-0 inset-x-0 bg-lime-400 text-slate-950 text-[10px] font-black text-center py-0.5">
                                                POSTER UTAMA
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Informasi Dasar & Olahraga */}
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-5">
                        <div className="flex items-center space-x-2.5">
                            <Trophy className="w-5 h-5 text-lime-400" />
                            <h2 className="text-base font-bold text-white">Informasi Dasar Turnamen</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Nama Turnamen *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={e => form.setData('name', e.target.value)}
                                    placeholder="Contoh: Jakarta Padel Open Championship 2026"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-lime-400 font-medium"
                                />
                                {form.errors.name && <div className="text-rose-400 text-xs mt-1">{form.errors.name}</div>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Jenis Olahraga *
                                </label>
                                <select
                                    value={form.data.sport_type}
                                    onChange={e => form.setData('sport_type', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                                >
                                    <option value="padel">Padel</option>
                                    <option value="tennis">Tennis</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Deskripsi Turnamen
                            </label>
                            <textarea
                                rows={3}
                                value={form.data.description}
                                onChange={e => form.setData('description', e.target.value)}
                                placeholder="Jelaskan ringkasan acara, sponsor, atau daya tarik kompetisi..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-lime-400"
                            />
                        </div>
                    </div>

                    {/* 3. Lokasi Venue & Wilayah Indonesia */}
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-5">
                        <div className="flex items-center space-x-2.5">
                            <MapPin className="w-5 h-5 text-lime-400" />
                            <h2 className="text-base font-bold text-white">Lokasi Venue & Wilayah</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Nama Venue Lapangan *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.venue_name}
                                    onChange={e => form.setData('venue_name', e.target.value)}
                                    placeholder="Contoh: Padelibre Kemang / Verde Padel Court"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-lime-400 font-medium"
                                />
                                {form.errors.venue_name && <div className="text-rose-400 text-xs mt-1">{form.errors.venue_name}</div>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Tautan Google Maps
                                </label>
                                <input
                                    type="url"
                                    value={form.data.google_maps_url}
                                    onChange={e => form.setData('google_maps_url', e.target.value)}
                                    placeholder="https://maps.google.com/..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-lime-400 font-mono text-xs"
                                />
                            </div>

                            {/* Cascading Region Dropdown */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Provinsi {isLoadingProvinces && '(Memuat...)'}
                                </label>
                                <select
                                    value={form.data.province_id}
                                    onChange={handleProvinceChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400"
                                >
                                    <option value="">Pilih Provinsi</option>
                                    {provinces.map(p => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Kota / Kabupaten {isLoadingCities && '(Memuat...)'}
                                </label>
                                <select
                                    value={form.data.city_id}
                                    onChange={handleCityChange}
                                    disabled={!form.data.province_id || isLoadingCities}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-lime-400 disabled:opacity-50"
                                >
                                    <option value="">Pilih Kota / Kabupaten</option>
                                    {cities.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Alamat Lengkap Venue
                            </label>
                            <input
                                type="text"
                                value={form.data.venue_address}
                                onChange={e => form.setData('venue_address', e.target.value)}
                                placeholder="Jalan, nomor, kelurahan..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-lime-400"
                            />
                        </div>
                    </div>

                    {/* 4. Jadwal & Rekening Penarikan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Jadwal Tanggal */}
                        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
                            <div className="flex items-center space-x-2.5">
                                <Calendar className="w-5 h-5 text-lime-400" />
                                <h2 className="text-base font-bold text-white">Jadwal Tanggal</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Mulai *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.data.start_date}
                                        onChange={e => form.setData('start_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Selesai *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.data.end_date}
                                        onChange={e => form.setData('end_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase">Batas Akhir Pendaftaran</label>
                                <input
                                    type="datetime-local"
                                    value={form.data.registration_deadline}
                                    onChange={e => form.setData('registration_deadline', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                />
                            </div>
                        </div>

                        {/* Rekening Penarikan Uang */}
                        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
                            <div className="flex items-center space-x-2.5">
                                <CreditCard className="w-5 h-5 text-lime-400" />
                                <h2 className="text-base font-bold text-white">Rekening Penarikan Dana</h2>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Bank *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.data.bank_name}
                                        onChange={e => form.setData('bank_name', e.target.value)}
                                        placeholder="BCA"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 uppercase"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Nomor Rekening *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.data.bank_account_number}
                                        onChange={e => form.setData('bank_account_number', e.target.value)}
                                        placeholder="1234567890"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-lime-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase">Nama Pemilik Rekening *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.bank_account_holder}
                                    onChange={e => form.setData('bank_account_holder', e.target.value)}
                                    placeholder="Nama Lengkap Sesuai Buku Tabungan"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 5. Kategori Pertandingan Dinamis (Repeater) */}
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <Layers className="w-5 h-5 text-lime-400" />
                                <div>
                                    <h2 className="text-base font-bold text-white">Kategori Pertandingan Dinamis</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Pilihan Tier, Divisi, dan Skill Level tersinkronisasi instan dari Superadmin.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={addCategory}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/30 text-xs font-bold transition"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Kategori</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {form.data.categories.map((cat, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4 relative"
                                >
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                                        <span className="font-bold text-xs uppercase tracking-wider text-lime-400">
                                            Kategori #{idx + 1}
                                        </span>
                                        {form.data.categories.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(idx)}
                                                className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Hapus</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase">Nama Kategori *</label>
                                            <input
                                                type="text"
                                                required
                                                value={cat.name}
                                                onChange={e => updateCategory(idx, 'name', e.target.value)}
                                                placeholder="e.g. Men Beginner"
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 font-medium"
                                            />
                                        </div>

                                        {/* Dropdown Tier Dinamis dari Superadmin */}
                                        <div className="space-y-1">
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase">Tier Master</label>
                                            <select
                                                value={cat.tier_id}
                                                onChange={e => updateCategory(idx, 'tier_id', e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                            >
                                                <option value="">Pilih Tier</option>
                                                {masterTiers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Dropdown Divisi Dinamis dari Superadmin */}
                                        <div className="space-y-1">
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase">Divisi Master</label>
                                            <select
                                                value={cat.division_id}
                                                onChange={e => updateCategory(idx, 'division_id', e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                            >
                                                <option value="">Pilih Divisi</option>
                                                {masterDivisions.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Dropdown Skill Level Dinamis dari Superadmin */}
                                        <div className="space-y-1">
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase">Level Skill Master</label>
                                            <select
                                                value={cat.skill_level_id}
                                                onChange={e => updateCategory(idx, 'skill_level_id', e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                            >
                                                <option value="">Pilih Level</option>
                                                {masterSkillLevels.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase">Kuota Tim *</label>
                                            <input
                                                type="number"
                                                min={2}
                                                max={64}
                                                value={cat.max_teams}
                                                onChange={e => updateCategory(idx, 'max_teams', parseInt(e.target.value) || 2)}
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-lime-400"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase">Biaya Registrasi (Rp) *</label>
                                            <input
                                                type="number"
                                                min={0}
                                                step={10000}
                                                value={cat.registration_fee}
                                                onChange={e => updateCategory(idx, 'registration_fee', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-lime-400"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase">Format Turnamen</label>
                                            <select
                                                value={cat.format}
                                                onChange={e => updateCategory(idx, 'format', e.target.value as any)}
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                            >
                                                <option value="group_knockout">Grup + Knockout</option>
                                                <option value="knockout_only">Knockout Langsung</option>
                                                <option value="round_robin">Round Robin Penuh</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-2 pt-5">
                                            <input
                                                type="checkbox"
                                                id={`open-reg-${idx}`}
                                                checked={cat.is_open_registration}
                                                onChange={e => updateCategory(idx, 'is_open_registration', e.target.checked)}
                                                className="rounded bg-slate-900 border-slate-700 text-lime-400 focus:ring-lime-400"
                                            />
                                            <label htmlFor={`open-reg-${idx}`} className="text-xs text-slate-300 font-medium cursor-pointer">
                                                Buka Pendaftaran
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 6. Lapangan Awal (Courts) */}
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <Activity className="w-5 h-5 text-lime-400" />
                                <h2 className="text-base font-bold text-white">Lapangan Pertandingan</h2>
                            </div>

                            <button
                                type="button"
                                onClick={addCourt}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Lapangan</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {form.data.courts.map((court, idx) => (
                                <div key={idx} className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                                    <input
                                        type="text"
                                        required
                                        value={court.name}
                                        onChange={e => updateCourt(idx, 'name', e.target.value)}
                                        placeholder={`Lapangan ${idx + 1}`}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 font-medium"
                                    />
                                    {form.data.courts.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCourt(idx)}
                                            className="text-slate-500 hover:text-rose-400 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <Link
                            href={route('organizer.tournaments.index')}
                            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-8 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm transition shadow-xl shadow-lime-400/20 active:scale-95 disabled:opacity-50"
                        >
                            {form.processing ? 'Menyimpan...' : 'Simpan Sebagai Draft'}
                        </button>
                    </div>
                </form>
            </div>
        </OrganizerLayout>
    );
}
