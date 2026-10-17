import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Users, 
    Search, 
    ShieldCheck, 
    UserCheck, 
    UserX, 
    LogIn, 
    Sparkles 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface UserItem {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: boolean;
    city_name?: string;
    roles: Array<{ id: number; name: string }>;
}

interface RoleItem {
    id: number;
    name: string;
}

interface PageProps {
    users: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    roles: RoleItem[];
    filters: {
        search?: string;
        role?: string;
    };
}

export default function UsersIndex({ users, roles, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), {
            search: search || undefined,
            role: selectedRole || undefined,
        }, { preserveState: true });
    };

    const handleRoleChange = (userId: number, roleName: string) => {
        router.patch(route('admin.users.update-role', userId), { role: roleName }, {
            onSuccess: () => toast.success('Role pengguna berhasil diperbarui!'),
            onError: () => toast.error('Gagal memperbarui role.'),
        });
    };

    const handleToggleStatus = (userId: number) => {
        router.patch(route('admin.users.toggle-status', userId), {}, {
            onSuccess: () => toast.success('Status akun berhasil diubah!'),
            onError: () => toast.error('Gagal mengubah status akun.'),
        });
    };

    const handleImpersonate = (userId: number) => {
        router.post(route('admin.impersonate', userId));
    };

    return (
        <AdminLayout title="Manajemen Pengguna & Hak Akses (RBAC)">
            <Head title="Manajemen Pengguna - Superadmin" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6">
                {/* Header Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, email, atau WhatsApp..."
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-accent-primary focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                            Cari
                        </button>
                    </form>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                router.get(route('admin.users.index'), {
                                    search: search || undefined,
                                    role: e.target.value || undefined,
                                }, { preserveState: true });
                            }}
                            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-white focus:border-accent-primary focus:outline-none"
                        >
                            <option value="">Semua Peran / Role</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.name}>
                                    {r.name.toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <span className="text-xs text-slate-400 font-medium">
                            Total: {users.total} Pengguna
                        </span>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                                <tr>
                                    <th className="px-6 py-3.5 font-bold uppercase">Pengguna</th>
                                    <th className="px-6 py-3.5 font-bold uppercase">Kontak</th>
                                    <th className="px-6 py-3.5 font-bold uppercase">Peran / Role</th>
                                    <th className="px-6 py-3.5 font-bold uppercase text-center">Status</th>
                                    <th className="px-6 py-3.5 font-bold uppercase text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                {users.data.map((u) => {
                                    const currentRole = u.roles[0]?.name || 'player';

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-850/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-slate-200">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{u.name}</p>
                                                        <p className="text-[10px] text-slate-500">{u.city_name || 'Indonesia'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-200 font-mono text-[11px]">{u.email}</p>
                                                <p className="text-slate-400 text-[10px]">{u.phone || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={currentRole}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 focus:border-accent-primary focus:outline-none"
                                                >
                                                    {roles.map((r) => (
                                                        <option key={r.id} value={r.name}>
                                                            {r.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(u.id)}
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
                                                        u.is_active
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                                    }`}
                                                >
                                                    {u.is_active ? (
                                                        <>
                                                            <UserCheck className="h-3 w-3" />
                                                            AKTIF
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserX className="h-3 w-3" />
                                                            NONAKTIF
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleImpersonate(u.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:border-slate-600 hover:text-white transition-all shadow-sm"
                                                    title="Login sebagai pengguna ini"
                                                >
                                                    <LogIn className="h-3 w-3 text-accent-primary" />
                                                    <span>Impersonate</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
