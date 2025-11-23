<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show($slug)
{
    
    $product = Product::with([
        'discounts',
        'variants.values',
        'variants.values.attribute', 
        'images',
        'categories',
    ])->where('slug', $slug)->firstOrFail();

    $relatedProducts = Product::whereHas('categories', function ($q) use ($product) {
            $q->whereIn('categories.id', $product->categories->pluck('id'));
        })
        ->where('id', '!=', $product->id)
        ->with('categories')
         ->with('variants')
        ->take(8)
        ->get();
    $categories = Category::with(['products' => function ($q) {
            $q->latest()->take(1); // only latest product
        }])->get();
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


    return Inertia::render('Products/Show', [
        'product' => $product,
        'relatedProducts' => $relatedProducts,
         'categories' => $categories,
         'menCategories'   => $menCategories,
        'womenCategories' => $womenCategories,
        'topCategories'   => $topCategories ,
    ]);
}
    public function search(Request $request)
{
    //dd($request->all());
    $q = $request->input('q');

    $products = Product::
    with([
        'discounts',
        'variants.values',
        'variants.values.attribute', 
        'images',
        'categories',
    ])->
    where('name', 'like', "%{$q}%")
    ->orWhere('description', 'like', "%{$q}%")
    ->get();
    $categories = Category::all();
    $settings = Setting::first();
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

    return inertia('Search/Results', [
        'query' => $q,
        'products' => $products,
        'categories' => $categories,
        'settings' => $settings,
        'menCategories'   => $menCategories,
        'womenCategories' => $womenCategories,
        'topCategories'   => $topCategories ,
    ]);
}


}
