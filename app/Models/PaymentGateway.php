<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    protected $fillable = [
        'name', 'slug', 'is_active', 'credentials',
    ];

    protected $casts = [
        'credentials' => 'array',
        'is_active' => 'boolean',
    ];

    // Quick helper
    public static function active()
    {
        return static::where('is_active', true)->get();
    }
}
