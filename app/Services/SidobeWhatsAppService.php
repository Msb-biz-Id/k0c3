<?php

namespace App\Services;

use App\Models\WhatsAppConfig;
use App\Models\WhatsAppLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SidobeWhatsAppService
{
    /**
     * Format phone number to standard international WhatsApp format (+62 / 628xxx).
     */
    public function formatPhoneNumber(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($cleaned, '08')) {
            return '628' . substr($cleaned, 2);
        }

        if (str_starts_with($cleaned, '8')) {
            return '628' . substr($cleaned, 1);
        }

        return $cleaned;
    }

    /**
     * Send WhatsApp notification through Sidobe.com Gateway with audit logging.
     *
     * @param string $phone
     * @param string $message
     * @param string $eventType e.g. registration_approved, court_call, match_result, test_sandbox
     * @return array ['success' => bool, 'log_id' => string, 'message' => string]
     */
    public function sendMessage(string $phone, string $message, string $eventType = 'general'): array
    {
        $config = WhatsAppConfig::first();
        $formattedPhone = $this->formatPhoneNumber($phone);

        $payload = [
            'phone' => $formattedPhone,
            'message' => $message,
            'device_id' => $config?->device_id,
        ];

        $status = 'pending';
        $apiResponse = null;

        // If active config exists with API Token, make the actual HTTP call to sidobe
        if ($config && $config->is_active && !empty($config->api_token)) {
            try {
                $response = Http::timeout(10)
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $config->api_token,
                        'Accept' => 'application/json',
                    ])
                    ->post(rtrim($config->base_url, '/') . '/api/send', $payload);

                $apiResponse = $response->json();
                $status = $response->successful() ? 'sent' : 'failed';
            } catch (\Throwable $e) {
                Log::warning("Sidobe WhatsApp Gateway connection error: " . $e->getMessage());
                $status = 'failed';
                $apiResponse = ['error' => $e->getMessage()];
            }
        } else {
            // Simulated sandbox mode (Local Dev / Offline test)
            $status = 'sent';
            $apiResponse = ['status' => 'simulated', 'info' => 'Simulated dispatch in local sandbox'];
        }

        // Audit Trail log
        $log = WhatsAppLog::create([
            'phone' => $formattedPhone,
            'message' => $message,
            'event_type' => $eventType,
            'status' => $status,
            'payload_request' => $payload,
            'api_response' => $apiResponse,
            'sent_at' => now(),
        ]);

        return [
            'success' => $status === 'sent',
            'log_id' => $log->id,
            'status' => $status,
        ];
    }
}
