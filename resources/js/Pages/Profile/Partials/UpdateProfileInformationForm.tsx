import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Trophy, Phone, ShieldCheck, Activity } from 'lucide-react';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    skillLevels?: Array<{ id: string; name: string }>;
    provinces?: Array<{ id: string; name: string }>;
    className?: string;
}

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    skillLevels = [],
    provinces = [],
    className = '',
}: Props) {
    const user = usePage().props.auth.user as any;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || 'male',
            skill_level: user.skill_level || 'Beginner',
            preferred_side: user.preferred_side || 'left',
            dominant_hand: user.dominant_hand || 'right',
            playtomic_rating: user.playtomic_rating || 1.5,
            city_name: user.city_name || '',
            bio: user.bio || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="space-y-1 pb-4 border-b border-slate-800">
                <h2 className="text-lg font-black text-white flex items-center space-x-2">
                    <User className="w-5 h-5 text-lime-400" />
                    <span>Informasi Akun & Data Atlet Padel</span>
                </h2>
                <p className="text-xs text-slate-400">
                    Perbarui profil atlet Anda. Data ini akan ditampilkan pada leaderboard nasional dan statistik 5D radar.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Basic Account Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" className="text-slate-300 text-xs font-bold" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full bg-slate-950 border-slate-800 text-white text-xs focus:border-lime-400"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Alamat Email" className="text-slate-300 text-xs font-bold" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full bg-slate-950 border-slate-800 text-white text-xs focus:border-lime-400"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="phone" value="No. WhatsApp" className="text-slate-300 text-xs font-bold" />
                        <TextInput
                            id="phone"
                            type="tel"
                            placeholder="08123456789"
                            className="mt-1 block w-full bg-slate-950 border-slate-800 text-white font-mono text-xs focus:border-lime-400"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.phone} />
                    </div>

                    <div>
                        <InputLabel value="Jenis Kelamin" className="text-slate-300 text-xs font-bold" />
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => setData('gender', 'male')}
                                className={`py-2 rounded-xl text-xs font-bold border transition ${
                                    data.gender === 'male'
                                        ? 'bg-lime-400 text-slate-950 border-lime-400 font-black'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                Pria
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('gender', 'female')}
                                className={`py-2 rounded-xl text-xs font-bold border transition ${
                                    data.gender === 'female'
                                        ? 'bg-lime-400 text-slate-950 border-lime-400 font-black'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                Wanita
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sporting Attributes */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Keahlian & Karakteristik Bermain</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <InputLabel htmlFor="skill_level" value="Level Kemampuan" className="text-slate-300 text-xs font-bold" />
                            <select
                                id="skill_level"
                                value={data.skill_level}
                                onChange={(e) => setData('skill_level', e.target.value)}
                                className="mt-1 block w-full rounded-xl bg-slate-950 border-slate-800 text-white text-xs focus:border-lime-400"
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

                        <div>
                            <InputLabel htmlFor="preferred_side" value="Sisi Lapangan (Drive)" className="text-slate-300 text-xs font-bold" />
                            <select
                                id="preferred_side"
                                value={data.preferred_side}
                                onChange={(e) => setData('preferred_side', e.target.value)}
                                className="mt-1 block w-full rounded-xl bg-slate-950 border-slate-800 text-white text-xs focus:border-lime-400"
                            >
                                <option value="left">Sisi Kiri (Backhand / Smash)</option>
                                <option value="right">Sisi Kanan (Drive / Control)</option>
                                <option value="both">Keduanya (Fleksibel)</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="dominant_hand" value="Tangan Dominan" className="text-slate-300 text-xs font-bold" />
                            <select
                                id="dominant_hand"
                                value={data.dominant_hand}
                                onChange={(e) => setData('dominant_hand', e.target.value)}
                                className="mt-1 block w-full rounded-xl bg-slate-950 border-slate-800 text-white text-xs focus:border-lime-400"
                            >
                                <option value="right">Tangan Kanan</option>
                                <option value="left">Tangan Kiri (Kidal)</option>
                                <option value="ambidextrous">Keduanya (Ambidextrous)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="playtomic_rating" value="Rating Playtomic" className="text-slate-300 text-xs font-bold" />
                            <TextInput
                                id="playtomic_rating"
                                type="number"
                                step="0.1"
                                min="0.5"
                                max="7.0"
                                className="mt-1 block w-full bg-slate-950 border-slate-800 text-white font-mono text-xs focus:border-lime-400"
                                value={data.playtomic_rating}
                                onChange={(e) => setData('playtomic_rating', parseFloat(e.target.value) || 1.0)}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="city_name" value="Kota Domisili" className="text-slate-300 text-xs font-bold" />
                            <TextInput
                                id="city_name"
                                placeholder="Contoh: Jakarta Selatan, Surabaya, Bali"
                                className="mt-1 block w-full bg-slate-950 border-slate-800 text-white text-xs focus:border-lime-400"
                                value={data.city_name}
                                onChange={(e) => setData('city_name', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="bio" value="Bio Singkat / Moto Bertanding" className="text-slate-300 text-xs font-bold" />
                        <textarea
                            id="bio"
                            rows={3}
                            placeholder="Tuliskan gaya bermain, klub favorit, atau pengalaman turnamen..."
                            className="mt-1 block w-full rounded-xl bg-slate-950 border-slate-800 text-white text-xs focus:border-lime-400"
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                        />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300">
                        <p>
                            Alamat email Anda belum diverifikasi.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="text-lime-400 underline font-bold"
                            >
                                Klik di sini untuk mengirim ulang link verifikasi.
                            </Link>
                        </p>
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black transition shadow-lg shadow-lime-400/20 active:scale-95 disabled:opacity-50"
                    >
                        Simpan Perubahan
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs text-emerald-400 font-bold">
                            Profil atlet berhasil diperbarui!
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
