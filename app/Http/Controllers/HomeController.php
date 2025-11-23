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
        //dd($topProducts,$menProducts,$womenProducts);

        // Categories
        $categories = Category::with(['products' => function ($q) {
            $q->latest()->take(1);
        }])
        ->get();
        $menCategory = Category::where('slug', 'men')->first();
        $womenCategory = Category::where('slug', 'women')->first();

// categories that intersect with men
        $menCategories = Category::whereHas('products', function ($q) use ($menCategory) {
            $q->whereHas('categories', function ($qq) use ($menCategory) {
                $qq->where('categories.id', $menCategory->id);
            });
        })
        ->where('slug', '!=', 'men')
        ->get();

// categories that intersect with women
        $womenCategories = Category::whereHas('products', function ($q) use ($womenCategory) {
            $q->whereHas('categories', function ($qq) use ($womenCategory) {
                $qq->where('categories.id', $womenCategory->id);
            });
        })
        ->where('slug', '!=', 'women')
        ->get();
        $topCategories = Category::withCount('products')
                        ->orderByDesc('products_count')
                        ->whereNot('slug','men')
                        ->whereNot('slug','women')
                        ->take(6)
                        ->get();;

        return Inertia::render('Home/Home', [
            'topProducts' => $topProducts,
            'menProducts' => $menProducts,
            'womenProducts' => $womenProducts,
            'categories' => $categories,
            'menCategories'   => $menCategories,
            'womenCategories' => $womenCategories,
            'topCategories'   => $topCategories ,
        ]);
    }
}
