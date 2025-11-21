<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
{
    $products = Product::with([
        'variants.discounts',
        'variants.values',
        'variants.values.attribute',
        'images',
        'categories',
    ])
    ->latest()
    ->take(8)
    ->get()
    ->map(function ($product) {

        $applyDiscount = function ($price, $discount) {
            if (!$discount) return $price;

            if ($discount->type === 'percentage') {
                return max($price - ($price * ($discount->value / 100)), 0);
            }

            if ($discount->type === 'fixed') {
                return max($price - $discount->value, 0);
            }

            return $price;
        };

        // Compute final price for each variant
        $product->variants->each(function ($variant) use ($applyDiscount, $product) {

            $basePrice = $variant->price ?? $product->price;

            $activeDiscount = $variant->discounts
                ?->where('is_active', true)
                ?->first();

            $finalPrice = $activeDiscount
                ? $applyDiscount($basePrice, $activeDiscount)
                : $basePrice;

            $variant->original_price = $basePrice;
            $variant->final_price = $finalPrice;
            $variant->price_before_discount = $basePrice;
        });

        return $product;
    });

    $categories = Category::with(['products' => function ($q) {
        $q->latest()->take(1);
    }])
    ->take(10)
    ->get();

    return Inertia::render('Home/Home', [
        'products'   => $products,
        'categories' => $categories,
    ]);
}

}
