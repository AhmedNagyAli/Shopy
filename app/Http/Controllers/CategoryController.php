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
            ->with('products') // load all products for that category
            ->firstOrFail();

        return Inertia::render('Categories/Show', [
            'category' => $category,
        ]);
    }
}
