<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// API Wilayah Indonesia (Cached & Throttled)
Route::prefix('api/regions')->middleware('throttle:60,1')->group(function () {
    Route::get('/provinces', [RegionController::class, 'provinces'])->name('api.regions.provinces');
    Route::get('/cities/{province_code}', [RegionController::class, 'cities'])->name('api.regions.cities');
});

use App\Http\Controllers\PublicTournamentController;

// Portal Publik & Turnamen Directory
Route::get('/', [PublicTournamentController::class, 'index'])->name('home');
Route::get('/tournaments', [PublicTournamentController::class, 'tournaments'])->name('tournaments.index');
Route::get('/tournaments/{slug}', [PublicTournamentController::class, 'show'])->name('tournaments.show');
Route::get('/tournaments/{slug}/slideshow', [PublicTournamentController::class, 'slideshow'])->name('tournaments.slideshow');
Route::get('/tournaments/{slug}/register', [\App\Http\Controllers\TournamentRegistrationController::class, 'create'])->name('tournaments.register');
Route::post('/tournaments/{slug}/register', [\App\Http\Controllers\TournamentRegistrationController::class, 'store'])->middleware('throttle:10,1')->name('tournaments.register.store');

// Athlete Directory, Leaderboard & 5D Radar
Route::get('/leaderboard', [PublicTournamentController::class, 'leaderboard'])->name('leaderboard');
Route::get('/leaderboard/{id}', [\App\Http\Controllers\PlayerProfileController::class, 'show'])->name('leaderboard.show');
Route::get('/players', [PublicTournamentController::class, 'leaderboard'])->name('players.index');
Route::get('/players/{id}', [\App\Http\Controllers\PlayerProfileController::class, 'show'])->name('players.show');
Route::get('/winners', [PublicTournamentController::class, 'winners'])->name('winners');

// Global Quick Search (Command Palette ⌘K)
Route::get('/api/search', [PublicTournamentController::class, 'search'])->middleware('throttle:60,1')->name('api.search');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

use App\Http\Controllers\SettingsController;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // User Settings Hub (/settings/*)
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/profile', [SettingsController::class, 'profile'])->name('profile');
        Route::get('/password', [SettingsController::class, 'password'])->name('password');
        Route::get('/appearance', [SettingsController::class, 'appearance'])->name('appearance');
    });
});

use App\Http\Controllers\Admin\ImpersonationController;
use App\Http\Controllers\Admin\MasterDataController;

// Superadmin Control Center & Dynamic Master Data
Route::middleware(['auth', 'role:superadmin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/master', [MasterDataController::class, 'index'])->name('master.index');

    // Tiers
    Route::post('/master/tiers', [MasterDataController::class, 'storeTier'])->name('master.tiers.store');
    Route::put('/master/tiers/{id}', [MasterDataController::class, 'updateTier'])->name('master.tiers.update');
    Route::patch('/master/tiers/{id}/toggle-status', [MasterDataController::class, 'toggleTierStatus'])->name('master.tiers.toggle-status');
    Route::delete('/master/tiers/{id}', [MasterDataController::class, 'destroyTier'])->name('master.tiers.destroy');

    // Divisions
    Route::post('/master/divisions', [MasterDataController::class, 'storeDivision'])->name('master.divisions.store');
    Route::put('/master/divisions/{id}', [MasterDataController::class, 'updateDivision'])->name('master.divisions.update');
    Route::patch('/master/divisions/{id}/toggle-status', [MasterDataController::class, 'toggleDivisionStatus'])->name('master.divisions.toggle-status');
    Route::delete('/master/divisions/{id}', [MasterDataController::class, 'destroyDivision'])->name('master.divisions.destroy');

    // Skill Levels
    Route::post('/master/skill-levels', [MasterDataController::class, 'storeSkillLevel'])->name('master.skill-levels.store');
    Route::put('/master/skill-levels/{id}', [MasterDataController::class, 'updateSkillLevel'])->name('master.skill-levels.update');
    Route::patch('/master/skill-levels/{id}/toggle-status', [MasterDataController::class, 'toggleSkillLevelStatus'])->name('master.skill-levels.toggle-status');
    Route::delete('/master/skill-levels/{id}', [MasterDataController::class, 'destroySkillLevel'])->name('master.skill-levels.destroy');

    // Batch Reorder API
    Route::patch('/master/reorder', [MasterDataController::class, 'reorder'])->name('master.reorder');

    // WhatsApp Gateway sidobe.com Settings
    Route::get('/whatsapp', [\App\Http\Controllers\Admin\WhatsAppSettingsController::class, 'index'])->name('whatsapp.index');
    Route::put('/whatsapp', [\App\Http\Controllers\Admin\WhatsAppSettingsController::class, 'update'])->name('whatsapp.update');
    Route::post('/whatsapp/test', [\App\Http\Controllers\Admin\WhatsAppSettingsController::class, 'sendTest'])->middleware('throttle:5,1')->name('whatsapp.test');

    // Blog CMS Engine
    Route::resource('blog', \App\Http\Controllers\Admin\BlogController::class)->except(['show']);

    // EO Financial Payout Requests
    Route::get('/payouts', [\App\Http\Controllers\Admin\PayoutRequestController::class, 'index'])->name('payouts.index');
    Route::put('/payouts/{id}', [\App\Http\Controllers\Admin\PayoutRequestController::class, 'update'])->name('payouts.update');

    // User Management & RBAC
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::patch('/users/{id}/role', [\App\Http\Controllers\Admin\UserController::class, 'updateRole'])->name('users.update-role');
    Route::patch('/users/{id}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');

    // Global Company Profile, SEO & Landing Page CMS
    Route::get('/company-profile', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'index'])->name('company.index');
    Route::put('/company-profile', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'updateCompany'])->name('company.update');
    Route::put('/company-profile/seo', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'updateSeo'])->name('company.seo.update');
    
    // Hero Slides
    Route::post('/company-profile/hero-slides', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'storeHeroSlide'])->name('company.hero.store');
    Route::put('/company-profile/hero-slides/{id}', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'updateHeroSlide'])->name('company.hero.update');
    Route::delete('/company-profile/hero-slides/{id}', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'destroyHeroSlide'])->name('company.hero.destroy');
    Route::patch('/company-profile/hero-slides/{id}/toggle-status', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'toggleHeroSlideStatus'])->name('company.hero.toggle-status');

    // Partner Slides
    Route::post('/company-profile/partners', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'storePartnerSlide'])->name('company.partners.store');
    Route::put('/company-profile/partners/{id}', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'updatePartnerSlide'])->name('company.partners.update');
    Route::delete('/company-profile/partners/{id}', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'destroyPartnerSlide'])->name('company.partners.destroy');
    Route::patch('/company-profile/partners/{id}/toggle-status', [\App\Http\Controllers\Admin\CompanyProfileController::class, 'togglePartnerSlideStatus'])->name('company.partners.toggle-status');

    // Impersonate EO
    Route::post('/impersonate/{user}', [ImpersonationController::class, 'impersonate'])->name('impersonate');
});

// Public Blog Reader
Route::get('/blog', [\App\Http\Controllers\PublicBlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [\App\Http\Controllers\PublicBlogController::class, 'show'])->name('blog.show');

// Leave Impersonation
Route::post('/leave-impersonation', [ImpersonationController::class, 'leave'])->middleware('auth')->name('impersonation.leave');

use App\Http\Controllers\Organizer\CategoryEngineController;
use App\Http\Controllers\Organizer\TournamentController;

// Event Organizer (EO) Operations Hub
Route::middleware(['auth', 'role:organizer|superadmin'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::get('/tournaments', [TournamentController::class, 'index'])->name('tournaments.index');
    Route::get('/tournaments/create', [TournamentController::class, 'create'])->name('tournaments.create');
    Route::post('/tournaments', [TournamentController::class, 'store'])->name('tournaments.store');
    Route::get('/tournaments/{id}', [TournamentController::class, 'show'])->name('tournaments.show');
    Route::patch('/tournaments/{id}/publish', [TournamentController::class, 'publish'])->name('tournaments.publish');
    Route::delete('/tournaments/{id}', [TournamentController::class, 'destroy'])->name('tournaments.destroy');

    // Category Match Engine
    Route::prefix('tournaments/{tournamentId}/categories/{categoryId}')->name('categories.')->group(function () {
        // 1. Configure
        Route::get('/configure', [CategoryEngineController::class, 'configure'])->name('configure');
        Route::put('/configure', [CategoryEngineController::class, 'updateConfigure'])->name('configure.update');

        // 2. Teams & Draw
        Route::get('/teams', [CategoryEngineController::class, 'teams'])->name('teams');
        Route::post('/teams/manual', [CategoryEngineController::class, 'storeManualTeam'])->name('teams.manual');
        Route::post('/draw-groups', [CategoryEngineController::class, 'drawGroups'])->name('draw-groups');

        // 3. Matches & Fixtures
        Route::get('/matches', [CategoryEngineController::class, 'matches'])->name('matches');
        Route::post('/generate-fixtures', [CategoryEngineController::class, 'generateFixtures'])->name('generate-fixtures');

        // 4. Groups Standings
        Route::get('/groups', [CategoryEngineController::class, 'groups'])->name('groups');

        // 5. Knockout Bracket
        Route::get('/bracket', [CategoryEngineController::class, 'bracket'])->name('bracket');
        Route::post('/generate-bracket', [CategoryEngineController::class, 'generateBracket'])->name('generate-bracket');

        // 6. Rulebook & Regulasi
        Route::get('/rules', [CategoryEngineController::class, 'rules'])->name('rules');
        Route::put('/rules', [CategoryEngineController::class, 'updateRules'])->name('rules.update');
    });

    // Time-Court Schedule Matrix
    Route::get('/tournaments/{tournamentId}/schedule', [\App\Http\Controllers\Organizer\TournamentScheduleController::class, 'index'])->name('tournaments.schedule');
    Route::post('/tournaments/{tournamentId}/schedule/assign', [\App\Http\Controllers\Organizer\TournamentScheduleController::class, 'assign'])->name('tournaments.schedule.assign');
    Route::post('/tournaments/{tournamentId}/schedule/unassign', [\App\Http\Controllers\Organizer\TournamentScheduleController::class, 'unassign'])->name('tournaments.schedule.unassign');
    Route::post('/tournaments/{tournamentId}/schedule/auto', [\App\Http\Controllers\Organizer\TournamentScheduleController::class, 'autoSchedule'])->name('tournaments.schedule.auto');
    Route::post('/tournaments/{tournamentId}/schedule/reset', [\App\Http\Controllers\Organizer\TournamentScheduleController::class, 'resetSchedule'])->name('tournaments.schedule.reset');

    // Master Courts & Referee Token Access
    Route::get('/tournaments/{tournamentId}/courts', [\App\Http\Controllers\Organizer\CourtManagementController::class, 'index'])->name('tournaments.courts');
    Route::post('/tournaments/{tournamentId}/courts', [\App\Http\Controllers\Organizer\CourtManagementController::class, 'store'])->name('tournaments.courts.store');
    Route::put('/tournaments/{tournamentId}/courts/{courtId}', [\App\Http\Controllers\Organizer\CourtManagementController::class, 'update'])->name('tournaments.courts.update');
    Route::post('/tournaments/{tournamentId}/courts/{courtId}/regenerate', [\App\Http\Controllers\Organizer\CourtManagementController::class, 'regenerateToken'])->name('tournaments.courts.regenerate');
    Route::delete('/tournaments/{tournamentId}/courts/{courtId}', [\App\Http\Controllers\Organizer\CourtManagementController::class, 'destroy'])->name('tournaments.courts.destroy');

    // Registration Management Hub (8 Status Tabs)
    Route::get('/tournaments/{tournamentId}/registrations', [\App\Http\Controllers\Organizer\RegistrationManagementController::class, 'index'])->name('tournaments.registrations');
    Route::post('/tournaments/{tournamentId}/registrations/{teamId}/status', [\App\Http\Controllers\Organizer\RegistrationManagementController::class, 'updateStatus'])->name('tournaments.registrations.status');
    Route::delete('/tournaments/{tournamentId}/registrations/{teamId}', [\App\Http\Controllers\Organizer\RegistrationManagementController::class, 'destroy'])->name('tournaments.registrations.destroy');

    // Score Logs Audit Trail
    Route::get('/tournaments/{tournamentId}/score-logs', [\App\Http\Controllers\Organizer\ScoreLogsController::class, 'index'])->name('tournaments.score-logs');

    // Real-Time Court Control Desk
    Route::get('/tournaments/{tournamentId}/court-control', [\App\Http\Controllers\Organizer\CourtControlController::class, 'index'])->name('tournaments.court-control');
    Route::post('/tournaments/{tournamentId}/court-control/assign', [\App\Http\Controllers\Organizer\CourtControlController::class, 'assignMatch'])->name('tournaments.court-control.assign');
    Route::post('/tournaments/{tournamentId}/court-control/matches/{matchId}/status', [\App\Http\Controllers\Organizer\CourtControlController::class, 'updateStatus'])->name('tournaments.court-control.status');
    Route::post('/tournaments/{tournamentId}/court-control/matches/{matchId}/call', [\App\Http\Controllers\Organizer\CourtControlController::class, 'callPlayers'])->name('tournaments.court-control.call');

    // Registration & Check-in Desk
    Route::get('/tournaments/{tournamentId}/check-in', [\App\Http\Controllers\Organizer\CheckInController::class, 'index'])->name('tournaments.check-in');
    Route::post('/tournaments/{tournamentId}/check-in/{teamId}/toggle', [\App\Http\Controllers\Organizer\CheckInController::class, 'toggleCheckIn'])->name('tournaments.check-in.toggle');
    Route::post('/tournaments/{tournamentId}/check-in/{teamId}/payment', [\App\Http\Controllers\Organizer\CheckInController::class, 'verifyPayment'])->name('tournaments.check-in.payment');

    // Official Match Sheet PDF
    Route::get('/tournaments/{tournamentId}/matches/{matchId}/pdf', [\App\Http\Controllers\Organizer\MatchSheetController::class, 'downloadPdf'])->name('tournaments.matches.pdf');

    // EO Income & Revenue Ledger
    Route::get('/income', [\App\Http\Controllers\Organizer\IncomeController::class, 'index'])->name('income.index');
    Route::post('/income/payout', [\App\Http\Controllers\Organizer\IncomeController::class, 'storePayout'])->name('income.payout');
});

// Referee Public Mobile Terminal (No Login, Secured with Unique Token)
Route::prefix('referee/{token}')->middleware('throttle:120,1')->name('referee.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Referee\RefereeScoringController::class, 'show'])->name('scoring');
    Route::post('/matches/{matchId}/start', [\App\Http\Controllers\Referee\RefereeScoringController::class, 'startMatch'])->name('matches.start');
    Route::post('/matches/{matchId}/score', [\App\Http\Controllers\Referee\RefereeScoringController::class, 'updateScore'])->name('matches.score');
});

require __DIR__.'/auth.php';



