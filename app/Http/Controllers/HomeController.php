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
        $userId = auth()->id();

        $products = Product::with([
        'variants.values',
        'variants.values.attribute', 
        'images',
        'categories',
    ])
    ->latest()
    ->take(10)
    ->get();

    

        $categories = Category::with(['products' => function ($q) {
            $q->latest()->take(1); // only latest product
        }])->get();

        return Inertia::render('Home/Home', [
            'products'   => $products,
            'categories' => $categories,
        ]);
    }
}
