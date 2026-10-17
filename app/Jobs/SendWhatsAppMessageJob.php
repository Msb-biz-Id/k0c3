<?php

namespace App\Jobs;

use App\Services\SidobeWhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 30, 60];

    public string $phone;
    public string $message;
    public string $eventType;

    public function __construct(string $phone, string $message, string $eventType = 'general')
    {
        $this->phone = $phone;
        $this->message = $message;
        $this->eventType = $eventType;
    }

    public function handle(SidobeWhatsAppService $service): void
    {
        $result = $service->sendMessage($this->phone, $this->message, $this->eventType);

        if (!$result['success']) {
            Log::warning("WhatsApp message to {$this->phone} failed to send: " . $result['message']);
        }
    }
}
