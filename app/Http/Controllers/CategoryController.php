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

        return Inertia::render('Categories/Show', [
            'category' => $category,
             'categories' => $categories,
        ]);
    }
}
