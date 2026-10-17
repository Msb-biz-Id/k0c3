import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { 
    User, 
    Mail, 
    Lock, 
    Phone, 
    Trophy, 
    MapPin, 
    ArrowRight, 
    ShieldCheck, 
    Activity,
    Zap
} from 'lucide-react';
import axios from 'axios';

interface ProvinceItem {
    id: string;
    name: string;
}

interface SkillLevelItem {
    id: string;
    name: string;
}

interface Props {
    skillLevels: SkillLevelItem[];
    provinces: ProvinceItem[];
}

export default function PlayerRegister({ skillLevels, provinces }: Props) {
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        gender: 'male',
        skill_level: skillLevels[0]?.name || 'Beginner',
        preferred_side: 'left',
        dominant_hand: 'right',
        playtomic_rating: 1.5,
        city_id: '',
        city_name: '',
        bio: '',
    });

    useEffect(() => {
        if (!selectedProvince) {
            setCities([]);
            return;
        }

        setIsLoadingCities(true);
        axios.get(`/api/regions/cities/${selectedProvince}`)
            .then(res => {
                const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
                setCities(list);
            })
            .catch(() => {
                setCities([]);
            })
            .finally(() => {
                setIsLoadingCities(false);
            });
    }, [selectedProvince]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('register.player.store'));
    };

    return (
        <GuestLayout>
            <Head title="Pendaftaran Atlet Padel - PadelGigs" />

            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-lime-400 selection:text-slate-950">
                <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-3">
                    <Link href="/" className="inline-flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-400/20">
                            <span className="font-mono text-slate-950 font-black text-lg">PG</span>
                        </div>
                        <span className="font-black text-2xl tracking-tight text-white">PADELGIGS</span>
                    </Link>

                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Registrasi Akun Atlet Padel
                    </h1>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Bergabunglah dengan ekosistem turnamen resmi, lacak ranking nasional, statistik head-to-head, dan radar keahlian 5D Anda.
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                    <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-lime-400 flex items-center space-x-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    <span>Informasi Dasar Akun</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Budi Santoso"
                                            value={form.data.name}
                                            onChange={e => form.setData('name', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                            required
                                        />
                                        {form.errors.name && <p className="text-rose-400 text-[11px]">{form.errors.name}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Email</label>
                                        <input
                                            type="email"
                                            placeholder="budi@example.com"
                                            value={form.data.email}
                                            onChange={e => form.setData('email', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                            required
                                        />
                                        {form.errors.email && <p className="text-rose-400 text-[11px]">{form.errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Password</label>
                                        <input
                                            type="password"
                                            placeholder="Minimal 8 karakter"
                                            value={form.data.password}
                                            onChange={e => form.setData('password', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                            required
                                        />
                                        {form.errors.password && <p className="text-rose-400 text-[11px]">{form.errors.password}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Konfirmasi Password</label>
                                        <input
                                            type="password"
                                            placeholder="Ulangi kata sandi"
                                            value={form.data.password_confirmation}
                                            onChange={e => form.setData('password_confirmation', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">No. WhatsApp</label>
                                        <input
                                            type="tel"
                                            placeholder="08123456789"
                                            value={form.data.phone}
                                            onChange={e => form.setData('phone', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 font-mono"
                                            required
                                        />
                                        {form.errors.phone && <p className="text-rose-400 text-[11px]">{form.errors.phone}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Jenis Kelamin</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => form.setData('gender', 'male')}
                                                className={`py-2 rounded-xl text-xs font-bold border transition ${
                                                    form.data.gender === 'male'
                                                        ? 'bg-lime-400 text-slate-950 border-lime-400 font-black'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                Pria
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => form.setData('gender', 'female')}
                                                className={`py-2 rounded-xl text-xs font-bold border transition ${
                                                    form.data.gender === 'female'
                                                        ? 'bg-lime-400 text-slate-950 border-lime-400 font-black'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                Wanita
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Padel Sporting Attributes */}
                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                                    <Trophy className="w-3.5 h-3.5" />
                                    <span>Spesifikasi & Keahlian Padel</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Level Kemampuan</label>
                                        <select
                                            value={form.data.skill_level}
                                            onChange={e => form.setData('skill_level', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                        >
                                            {skillLevels.map(sl => (
                                                <option key={sl.id} value={sl.name}>{sl.name}</option>
                                            ))}
                                            {skillLevels.length === 0 && (
                                                <>
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Sisi Lapangan (Drive)</label>
                                        <select
                                            value={form.data.preferred_side}
                                            onChange={e => form.setData('preferred_side', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                        >
                                            <option value="left">Sisi Kiri (Backhand / Smash)</option>
                                            <option value="right">Sisi Kanan (Drive / Control)</option>
                                            <option value="both">Keduanya (Fleksibel)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Tangan Dominan</label>
                                        <select
                                            value={form.data.dominant_hand}
                                            onChange={e => form.setData('dominant_hand', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                        >
                                            <option value="right">Tangan Kanan</option>
                                            <option value="left">Tangan Kiri (Kidal)</option>
                                            <option value="ambidextrous">Keduanya (Ambidextrous)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">
                                            Playtomic Level / Rating
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0.5"
                                            max="7.0"
                                            value={form.data.playtomic_rating}
                                            onChange={e => form.setData('playtomic_rating', parseFloat(e.target.value) || 1.0)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-lime-400"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Provinsi Asal</label>
                                        <select
                                            value={selectedProvince}
                                            onChange={e => setSelectedProvince(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                        >
                                            <option value="">Pilih Provinsi</option>
                                            {provinces.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Kota Domisili</label>
                                        <select
                                            value={form.data.city_id}
                                            disabled={!selectedProvince || isLoadingCities}
                                            onChange={e => {
                                                const cid = e.target.value;
                                                const cname = cities.find(c => c.id === cid)?.name || '';
                                                form.setData({ ...form.data, city_id: cid, city_name: cname });
                                            }}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 disabled:opacity-50"
                                        >
                                            <option value="">{isLoadingCities ? 'Memuat kota...' : 'Pilih Kota'}</option>
                                            {cities.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Bio Singkat / Moto Bermain</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Contoh: Pemain padel aktif Jabodetabek, suka bermain agresif di net..."
                                        value={form.data.bio}
                                        onChange={e => form.setData('bio', e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm transition shadow-lg shadow-lime-400/20 active:scale-95 disabled:opacity-50"
                            >
                                <span>Buat Profil Atlet Sekarang</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <div className="text-center text-xs text-slate-400 pt-2">
                                Sudah memiliki akun?{' '}
                                <Link href={route('login')} className="text-lime-400 hover:underline font-bold">
                                    Masuk di sini
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
