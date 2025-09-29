<?php

use App\Http\Controllers\HomeController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');



Route::get('/test-image', function () {
    // Just grab one product for testing
    $product = Product::first();

    return Inertia::render('TestImage', [
        'product' => $product,
    ]);
});
