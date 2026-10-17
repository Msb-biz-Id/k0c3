<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppConfig;
use App\Models\WhatsAppLog;
use App\Services\SidobeWhatsAppService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppSettingsController extends Controller
{
    /**
     * Display WhatsApp Gateway Settings & Dispatch Logs.
     */
    public function index(): Response
    {
        $config = WhatsAppConfig::firstOrCreate([], [
            'base_url' => 'https://api.sidobe.com',
            'is_active' => true,
            'templates' => [
                'registration' => "Halo {player_name},\nPendaftaran tim *{team_name}* pada kategori *{category_name}* di turnamen *{tournament_name}* telah diterima. Silakan selesaikan pembayaran via transfer.",
                'court_call' => "PANGGILAN LAPANGAN:\nTim *{team_name}* dipersilakan memasuki *{court_name}* untuk bertanding dalam waktu 5 menit.",
                'match_result' => "Hasil Pertandingan:\n*{team1}* ({score1}) vs ({score2}) *{team2}*.\nPemenang: *{winner_name}*.",
            ],
        ]);

        $recentLogs = WhatsAppLog::latest('created_at')->take(20)->get();

        return Inertia::render('Admin/WhatsApp/Index', [
            'config' => $config,
            'recentLogs' => $recentLogs,
        ]);
    }

    /**
     * Update WhatsApp Gateway Credentials.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'base_url' => ['required', 'url'],
            'api_token' => ['nullable', 'string', 'max:255'],
            'device_id' => ['nullable', 'string', 'max:100'],
            'webhook_key' => ['nullable', 'string', 'max:100'],
            'is_active' => ['required', 'boolean'],
            'templates' => ['nullable', 'array'],
        ]);

        $config = WhatsAppConfig::firstOrCreate([]);
        $config->update($validated);

        return back()->with('success', 'Konfigurasi WhatsApp Gateway sidobe.com berhasil diperbarui.');
    }

    /**
     * Send test message from sandbox simulator.
     */
    public function sendTest(Request $request, SidobeWhatsAppService $service): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:500'],
        ]);

        $result = $service->sendMessage($validated['phone'], $validated['message'], 'sandbox_test');

        if ($result['success']) {
            return back()->with('success', 'Pesan pengujian berhasil dikirim (Status: ' . $result['status'] . ')');
        }

        return back()->with('error', 'Gagal mengirim pesan pengujian.');
    }
}
