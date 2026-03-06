<?php

namespace App\Helpers;

use App\Models\Setting;

if (! function_exists('setting')) {
    /**
     * Get setting value by key
     */
    function setting(string $key, $default = null)
    {
        $setting = Setting::where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        // If it's image(s), return full URLs
        if ($setting->type === 'image') {
            return $setting->value ? asset('storage/' . $setting->value) : $default;
        }

        if ($setting->type === 'images') {
            return collect((array) $setting->value)
                ->map(fn ($path) => asset('storage/' . $path))
                ->toArray();
        }

        // Default (text)
        return $setting->value ?? $default;
    }
}