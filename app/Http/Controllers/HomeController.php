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
        return Inertia::render('Home/Home', [
            'products' => Product::with('categories')->latest()->take(10)->get(),
            'categories' => Category::with(['products' => function ($q) {
                $q->latest()->take(1); // only latest product
            }])->get(),
            //'category'=>Category::latest()->first(),
        ]);
    }
}
