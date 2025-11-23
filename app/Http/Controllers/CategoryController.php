<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
     public function show($slug)
    {
        $category = Category::where('slug', $slug)
            ->with([
                'products',
                'products.variants.values',
                'products.variants.values.attribute',
            ]) // load all products for that category
            ->firstOrFail();
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

        return Inertia::render('Categories/Show', [
            'category' => $category,
            'categories' => $categories,
            'menCategories'   => $menCategories,
            'womenCategories' => $womenCategories,
            'topCategories'   => $topCategories ,
        ]);
    }
}
