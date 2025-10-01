<?php

use App\Helpers\PriceHelper;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProductController;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');


Route::get('/categories/{slug}', [CategoryController::class, 'show'])->name('categories.show');
Route::post('/wishlist/{product}', [WishlistController::class, 'toggle'])
    ->name('wishlist.add');


    
    Route::middleware('guest')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');


Route::get('/test-image', function () {
    // Just grab one product for testing
    $product = Product::first();

    return Inertia::render('TestImage', [
        'product' => $product,
    ]);
});

Route::get('/teee',function(){
    // Get final price of a variant
$variant = ProductVariant::with('product')->find(7);
$price = PriceHelper::calculateFinalPrice($variant);

// Apply coupon to cart
$coupon = Coupon::where('code', 'SUMMER20')->first();
$cartTotal = 300;

$discountedCartTotal = PriceHelper::applyCoupon($coupon, $cartTotal);

dd($discountedCartTotal);


});
