import React from 'react';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { PageProps } from '@/types';
import UpdateProfileInformationForm from '../Profile/Partials/UpdateProfileInformationForm';
import DeleteUserForm from '../Profile/Partials/DeleteUserForm';

export default function Profile({
    mustVerifyEmail,
    status,
    skillLevels = [],
    provinces = [],
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    skillLevels?: Array<{ id: string; name: string }>;
    provinces?: Array<{ id: string; name: string }>;
}>) {
    return (
        <SettingsLayout title="Profil Atlet & Data Akun">
            <div className="space-y-8 max-w-4xl">
                <div className="p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        skillLevels={skillLevels}
                        provinces={provinces}
                        className="max-w-2xl"
                    />
                </div>

                <div className="p-6 md:p-8 bg-slate-900 border border-red-500/20 rounded-3xl shadow-xl">
                    <DeleteUserForm className="max-w-2xl" />
                </div>
            </div>
        </SettingsLayout>
    );
}
