<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
     public function store(Request $request)
    {
        logger($request->all());
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $cartItem = Cart::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'product_variant_id' => $request->product_variant_id,
            ],
            [
                'quantity' => \DB::raw('quantity + ' . ($request->quantity ?? 1))
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Added to cart',
            'cartItem' => $cartItem,
        ]);
    }

    public function index()
    {
        $cart = Cart::with(['product', 'variant'])->where('user_id', Auth::id())->get();

        return response()->json($cart);
    }
}
