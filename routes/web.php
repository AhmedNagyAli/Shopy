<?php

use App\Helpers\PriceHelper;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/search', [ProductController::class, 'search'])->name('search');


Route::get('/categories/{slug}', [CategoryController::class, 'show'])->name('categories.show');

Route::middleware(['auth'])->group(function () {
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::get('/wishlist/user', [WishlistController::class, 'userWishlist'])->name('wishlist.user');
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
});
// Route::post('/wishlist/{product}', [WishlistController::class, 'toggle'])
//     ->name('wishlist.add');

Route::middleware('auth')->group(function () {
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [CartController::class, 'store'])->name('cart.store');
    Route::get('/cart/items', [CartController::class, 'getCartItems'])->name('cart.items');
    Route::get('/cart/items/fetch', [CartController::class, 'fetch'])->name('cart.fetch');
    Route::post('/cart/items/{id}/update', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/items/{id}', [CartController::class, 'destroy'])->name('cart.destroy');
}); 
  

Route::middleware('auth')->group(function () {
    Route::get('/order/create', [OrderController::class, 'create'])->name('order.create');
    Route::post('/orders', [OrderController::class, 'store'])->name('order.store');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
});

Route::middleware('guest')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');


Route::get('test',function(){
    $user = Auth::user();
$wishlist = $user->wishlist()->with(['product', 'variant'])->get();
dd($wishlist);

});