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
        // 🔥 TOP PRODUCTS — products with most orders
        $topProducts = Product::with([
            'variants.discounts',
            'variants.values',
            'images',
        ])
       ->withCount('orderItems')
        //->orderBy('orders_count', 'desc')
        ->take(20)
        ->get();

        // 🔥 MEN PRODUCTS
        $menProducts = Product::whereHas('categories', fn($q) => 
            $q->where('slug', 'men')
        )
        ->with(['variants.discounts','images'])
        ->take(20)
        ->get();

        // 🔥 WOMEN PRODUCTS
        $womenProducts = Product::whereHas('categories', fn($q) => 
            $q->where('slug', 'women')
        )
        ->with(['variants.discounts','images'])
        ->take(20)
        ->get();

        // Categories
        $categories = Category::with(['products' => function ($q) {
            $q->latest()->take(1);
        }])
        ->take(10)
        ->get();

        return Inertia::render('Home/Home', [
            'topProducts' => $topProducts,
            'menProducts' => $menProducts,
            'womenProducts' => $womenProducts,
            'categories' => $categories,
        ]);
    }
}
