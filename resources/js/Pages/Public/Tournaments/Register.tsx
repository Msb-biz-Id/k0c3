import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
    Trophy, 
    ArrowLeft, 
    ArrowRight, 
    CheckCircle2, 
    Users, 
    CreditCard, 
    Upload, 
    ShieldCheck, 
    AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MobileBottomNav from '@/Components/MobileBottomNav';

interface Category {
    id: string;
    name: string;
    tier_name?: string;
    division_name?: string;
    skill_level_name?: string;
    registration_fee: number;
    max_teams: number;
    teams_count: number;
}

interface Tournament {
    id: string;
    name: string;
    slug: string;
    venue_name: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_holder?: string;
    categories: Category[];
}

interface Props {
    tournament: Tournament;
    currentUser?: any;
}

export default function TournamentRegister({ tournament, currentUser }: Props) {
    const { company } = usePage<any>().props;
    const brandName = company?.company_name || 'Koceevent';
    const [currentStep, setCurrentStep] = useState<number>(1);

    const { data, setData, post, processing, errors } = useForm({
        category_id: tournament.categories[0]?.id || '',
        team_name: '',
        // Player 1
        p1_name: currentUser?.name || '',
        p1_phone: currentUser?.phone || '',
        p1_email: currentUser?.email || '',
        p1_nik: '',
        p1_jersey_size: 'L',
        // Player 2
        p2_name: '',
        p2_phone: '',
        p2_email: '',
        p2_nik: '',
        p2_jersey_size: 'L',
        // Payment
        payment_receipt: null as File | null,
    });

    const selectedCategory = tournament.categories.find(c => c.id === data.category_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tournaments.register.store', tournament.slug || tournament.id));
    };

    const steps = [
        { num: 1, title: 'Kategori' },
        { num: 2, title: 'Kapten' },
        { num: 3, title: 'Partner' },
        { num: 4, title: 'Ringkasan' },
        { num: 5, title: 'Pembayaran' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
            <Head title={`Daftar Turnamen: ${tournament.name} - ${brandName}`} />

            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <Link href={route('tournaments.show', tournament.slug || tournament.id)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" />
                        Batal
                    </Link>
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">
                        {tournament.name}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                        Step {currentStep} dari 5
                    </span>
                </div>
            </header>

            {/* MAIN WIZARD FORM */}
            <main className="max-w-3xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
                {/* Step indicator bubbles */}
                <div className="flex items-center justify-between relative px-2">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                    {steps.map((s) => (
                        <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                currentStep === s.num
                                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-500/20'
                                    : currentStep > s.num
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                            }`}>
                                {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 hidden sm:block">
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                    {/* STEP 1: PILIH KATEGORI & NAMA TIM */}
                    {currentStep === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-emerald-400" />
                                    Pilih Kategori Tanding
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Tentukan divisi dan skill level yang sesuai dengan kemampuan pasangan Anda.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {tournament.categories.map((c) => {
                                    const isFull = (c.teams_count || 0) >= c.max_teams;
                                    const isSelected = data.category_id === c.id;
                                    return (
                                        <div
                                            key={c.id}
                                            onClick={() => !isFull && setData('category_id', c.id)}
                                            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                                                isSelected 
                                                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/10' 
                                                    : isFull 
                                                    ? 'opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-800' 
                                                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                            }`}
                                        >
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{c.name}</h4>
                                                <span className="text-[11px] text-slate-400">
                                                    Biaya: Rp {Number(c.registration_fee).toLocaleString('id-ID')} &bull; Kuota: {c.teams_count || 0}/{c.max_teams} Tim
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isFull ? (
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">Penuh</span>
                                                ) : (
                                                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                        isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                                                    }`}>
                                                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Nama Pasangan Tim:
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Jason & Budi"
                                    value={data.team_name}
                                    onChange={(e) => setData('team_name', e.target.value)}
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                                {errors.team_name && <p className="text-rose-400 text-xs mt-1">{errors.team_name}</p>}
                            </div>

                            <button
                                type="button"
                                disabled={!data.team_name || !data.category_id}
                                onClick={() => setCurrentStep(2)}
                                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition"
                            >
                                Lanjut: Data Pemain 1
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: DATA PEMAIN 1 (KAPTEN) */}
                    {currentStep === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Data Pemain 1 (Kapten)</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Informasi penanggung jawab tim dan kontak resmi.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap:</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.p1_name}
                                        onChange={(e) => setData('p1_name', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="08123456789"
                                        value={data.p1_phone}
                                        onChange={(e) => setData('p1_phone', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email:</label>
                                    <input
                                        type="email"
                                        value={data.p1_email}
                                        onChange={(e) => setData('p1_email', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Ukuran Jersey:</label>
                                    <select
                                        value={data.p1_jersey_size}
                                        onChange={(e) => setData('p1_jersey_size', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    >
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="button"
                                    disabled={!data.p1_name || !data.p1_phone}
                                    onClick={() => setCurrentStep(3)}
                                    className="w-2/3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                                >
                                    Lanjut: Data Pemain 2
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: DATA PEMAIN 2 (PARTNER) */}
                    {currentStep === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Data Pemain 2 (Partner)</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Informasi rekan pasangan tanding.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap Partner:</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.p2_name}
                                        onChange={(e) => setData('p2_name', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp Partner:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="08123456789"
                                        value={data.p2_phone}
                                        onChange={(e) => setData('p2_phone', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Partner:</label>
                                    <input
                                        type="email"
                                        value={data.p2_email}
                                        onChange={(e) => setData('p2_email', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Ukuran Jersey Partner:</label>
                                    <select
                                        value={data.p2_jersey_size}
                                        onChange={(e) => setData('p2_jersey_size', e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white"
                                    >
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="button"
                                    disabled={!data.p2_name || !data.p2_phone}
                                    onClick={() => setCurrentStep(4)}
                                    className="w-2/3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                                >
                                    Lanjut: Ringkasan Biaya
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: RINGKASAN PENDAFTARAN */}
                    {currentStep === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Ringkasan Pendaftaran</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Pastikan seluruh data atlet dan kategori sudah benar.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-400">Turnamen:</span>
                                    <span className="font-bold text-white">{tournament.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-400">Kategori:</span>
                                    <span className="font-bold text-emerald-400">{selectedCategory?.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-400">Nama Tim:</span>
                                    <span className="font-bold text-white">{data.team_name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-400">Pemain 1:</span>
                                    <span className="font-bold text-white">{data.p1_name} ({data.p1_jersey_size})</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-400">Pemain 2:</span>
                                    <span className="font-bold text-white">{data.p2_name} ({data.p2_jersey_size})</span>
                                </div>
                                <div className="flex justify-between pt-1 text-sm font-black">
                                    <span className="text-white">Total Tagihan:</span>
                                    <span className="text-emerald-400 font-mono">
                                        Rp {Number(selectedCategory?.registration_fee || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(3)}
                                    className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(5)}
                                    className="w-2/3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                                >
                                    Lanjut: Transfer Pembayaran
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: PEMBAYARAN TRANSFER & UPLOAD BUKTI */}
                    {currentStep === 5 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-emerald-400" />
                                    Instruksi Transfer Bank EO
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Silakan transfer sesuai nominal ke rekening resmi panitia pelaksana.
                                </p>
                            </div>

                            {/* Bank details card */}
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3">
                                <div className="text-xs text-slate-400">Bank Tujuan:</div>
                                <div className="text-xl font-black text-white">{tournament.bank_name || 'BCA (Bank Central Asia)'}</div>
                                <div className="text-xs text-slate-400">Nomor Rekening:</div>
                                <div className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                                    {tournament.bank_account_number || '8830-1928-3920'}
                                </div>
                                <div className="text-xs text-slate-400">
                                    Atas Nama: <strong className="text-white">{tournament.bank_account_holder || `PANITIA ${brandName.toUpperCase()}`}</strong>
                                </div>
                            </div>

                            {/* Upload receipt */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Upload Bukti Struk Transfer (JPG/PNG):
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('payment_receipt', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                                />
                                {errors.payment_receipt && <p className="text-rose-400 text-xs mt-1">{errors.payment_receipt}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(4)}
                                    className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    {processing ? 'Mengirim Pendaftaran...' : 'KIRIM FORMULIR PENDAFTARAN'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
