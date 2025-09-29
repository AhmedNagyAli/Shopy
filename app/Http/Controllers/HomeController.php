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

        $products = Product::with('categories')
    ->latest()
    ->take(10)
    ->when(auth()->check(), function ($query) {
        $query->withExists(['wishlistedBy as is_wishlisted' => function ($q) {
            $q->where('user_id', auth()->id());
        }]);
    })
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
