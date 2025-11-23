<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function show($slug)
{
    $categoryQuery = Category::where('slug', $slug)
        ->with([
            'products' => function ($q) use ($slug) {
                if ($slug === 'men') {
                    $q->whereHas('categories', function ($qq) {
                        $qq->where('slug', 'men');
                    });
                }

                if ($slug === 'women') {
                    $q->whereHas('categories', function ($qq) {
                        $qq->where('slug', 'women');
                    });
                }
            },
            'products.discounts',
            'products.images',
            'products.variants',
            'products.variants.values',
            'products.variants.discounts',
            'products.variants.values.attribute',
        ]);

    $category = $categoryQuery->firstOrFail();

    // Other categories sections
    $categories = Category::with(['products' => function ($q) {
        $q->latest()->take(1);
    }])->get();

    $menCategory = Category::where('slug', 'men')->first();
    $womenCategory = Category::where('slug', 'women')->first();

    // Categories intersecting with men
    $menCategories = Category::whereHas('products', function ($q) use ($menCategory) {
        $q->whereHas('categories', function ($qq) use ($menCategory) {
            $qq->where('categories.id', $menCategory->id);
        });
    })
    ->where('slug', '!=', 'men')
    ->get();

    // Categories intersecting with women
    $womenCategories = Category::whereHas('products', function ($q) use ($womenCategory) {
        $q->whereHas('categories', function ($qq) use ($womenCategory) {
            $qq->where('categories.id', $womenCategory->id);
        });
    })
    ->where('slug', '!=', 'women')
    ->get();

    $topCategories = Category::withCount('products')
        ->orderByDesc('products_count')
        ->whereNot('slug', 'men')
        ->whereNot('slug', 'women')
        ->take(6)
        ->get();

    return Inertia::render('Categories/Show', [
        'category'        => $category,
        'categories'      => $categories,
        'menCategories'   => $menCategories,
        'womenCategories' => $womenCategories,
        'topCategories'   => $topCategories,
    ]);
}

}
