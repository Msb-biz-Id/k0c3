import React from 'react';
import SettingsLayout from '@/Layouts/SettingsLayout';
import UpdatePasswordForm from '../Profile/Partials/UpdatePasswordForm';

export default function Password() {
    return (
        <SettingsLayout title="Keamanan & Kata Sandi">
            <div className="max-w-3xl">
                <div className="p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>
            </div>
        </SettingsLayout>
    );
}
