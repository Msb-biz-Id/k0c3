<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppConfig extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_configs';

    protected $fillable = [
        'base_url',
        'api_token',
        'device_id',
        'webhook_key',
        'is_active',
        'templates',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'templates' => 'array',
    ];
}
