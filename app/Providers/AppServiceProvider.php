<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'auth' => function () {
                return [
                    'user' => auth()->user(),
                ];
            },
        ]);

        Inertia::share('settings', function () {
            $settings = Setting::all()->pluck('value', 'key')->toArray();

            // 🚀 No need to decode again, it's already cast to array if JSON
            return $settings;
        });
    }
}
