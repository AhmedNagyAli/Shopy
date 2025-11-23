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
        $topProducts = Product::whereHas('categories', fn($q) => 
            $q->where('slug', 'men')
        )
        ->with([
            'variants.discounts',
            'variants.values',
            'images',
            'discounts',
        ])
        ->take(20)
        ->get();
        
        $menProducts = Product::whereHas('categories', fn($q) => 
            $q->where('slug', 'men')
        )
        ->with([
            'variants.discounts',
            'variants.values',
            'images',
            'discounts',
        ])
        ->take(20)
        ->get();



        $womenProducts = Product::whereHas('categories', fn($q) => 
            $q->where('slug', 'women')
        )->with([
            'variants.discounts',
            'variants.values',
            'images',
            'discounts',
        ])
        ->take(20)
        ->get();
        //dd($topProducts,$menProducts,$womenProducts);

        // Categories
        $categories = Category::with([
            'products.discounts',
                'products.images',
                'products.variants',
                'products.variants.values',
                'products.variants.discounts',
                'products.variants.values.attribute',
            'products' => function ($q) {
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
