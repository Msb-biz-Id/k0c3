<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create Granular Permissions from BRD.md 3.1
        $permissions = [
            'manage_rbac',
            'manage_whatsapp',
            'manage_blog',
            'manage_payouts',
            'manage_tournaments',
            'configure_rules',
            'verify_registrations',
            'manage_court_schedule',
            'manage_court_control',
            'input_court_scores',
            'check_in_players',
            'download_official_sheets',
            'view_own_registration',
        ];

        foreach ($permissions as $permName) {
            Permission::firstOrCreate(['name' => $permName]);
        }

        // 2. Create Roles and Assign Granular Permissions
        $rolesWithPerms = [
            'superadmin' => $permissions,
            'organizer' => [
                'manage_tournaments',
                'configure_rules',
                'verify_registrations',
                'manage_court_schedule',
                'manage_court_control',
                'input_court_scores',
                'check_in_players',
                'download_official_sheets',
            ],
            'tournament_desk' => [
                'verify_registrations',
                'manage_court_schedule',
                'manage_court_control',
                'input_court_scores',
                'check_in_players',
                'download_official_sheets',
            ],
            'referee' => [
                'input_court_scores',
            ],
            'content_editor' => [
                'manage_blog',
            ],
            'player' => [
                'view_own_registration',
            ],
        ];

        foreach ($rolesWithPerms as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($perms);
        }

        // 2. Create Superadmin User
        $superadmin = User::firstOrCreate(
            ['email' => 'admin@padelgigs.id'],
            [
                'name' => 'Super Administrator',
                'password' => Hash::make('password'),
                'phone' => '628111000111',
                'skill_level' => 'Intermediate',
                'preferred_side' => 'left',
                'dominant_hand' => 'right',
                'is_active' => true,
            ]
        );
        $superadmin->assignRole('superadmin');

        // 3. Create Event Organizer Demo User (Sesuai Audit Staging)
        $eo = User::firstOrCreate(
            ['email' => 'koceevent@padelgigs.id'],
            [
                'name' => 'KOCE Event Organizer',
                'password' => Hash::make('password'),
                'phone' => '6281234567890',
                'city_name' => 'Jakarta Selatan',
                'bio' => 'Official Tournament Organizer PadelGigs',
                'is_active' => true,
            ]
        );
        $eo->assignRole('organizer');

        // 4. Create Player Demo User (Jason Sugihan P. dari Audit Leaderboard)
        $player = User::firstOrCreate(
            ['email' => 'jason@padelgigs.id'],
            [
                'name' => 'Jason Sugihan P.',
                'password' => Hash::make('password'),
                'phone' => '628777888999',
                'gender' => 'male',
                'skill_level' => 'Beginner',
                'preferred_side' => 'right',
                'dominant_hand' => 'right',
                'city_name' => 'Jakarta Barat',
                'playtomic_rating' => 2.85,
                'bio' => 'Competitive Padel Player - Backhand specialist',
                'is_active' => true,
            ]
        );
        $player->assignRole('player');
    }
}
