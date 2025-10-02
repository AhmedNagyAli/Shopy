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

    return Inertia::render('Products/Show', [
        'product' => $product,
        'relatedProducts' => $relatedProducts,
    ]);
}
    public function search(Request $request)
{
    //dd($request->all());
    $q = $request->input('q');

    $products = Product::
    with([
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

    return inertia('Search/Results', [
        'query' => $q,
        'products' => $products,
        'categories' => $categories,
        'settings' => $settings,
    ]);
}


}
