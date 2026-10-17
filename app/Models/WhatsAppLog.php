<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppLog extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'whatsapp_logs';

    protected $fillable = [
        'phone',
        'message',
        'event_type',
        'status',
        'payload_request',
        'api_response',
        'sent_at',
    ];

    protected $casts = [
        'payload_request' => 'array',
        'api_response' => 'array',
        'sent_at' => 'datetime',
    ];
}
