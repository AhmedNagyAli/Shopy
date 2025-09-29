<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\WishlistController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/categories/{slug}', [CategoryController::class, 'show'])->name('categories.show');
Route::post('/wishlist/{product}', [WishlistController::class, 'toggle'])
    ->name('wishlist.add');

    
Route::get('/test-image', function () {
    // Just grab one product for testing
    $product = Product::first();

    return Inertia::render('TestImage', [
        'product' => $product,
    ]);
});
