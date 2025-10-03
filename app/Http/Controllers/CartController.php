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

    // Find existing cart item
    $existingCartItem = Cart::where('user_id', Auth::id())
        ->where('product_id', $request->product_id)
        ->where('product_variant_id', $request->product_variant_id)
        ->first();

    $quantity = $request->quantity ?? 1;

    if ($existingCartItem) {
        // Update existing item - increment quantity
        $existingCartItem->update([
            'quantity' => $existingCartItem->quantity + $quantity
        ]);
        $cartItem = $existingCartItem;
    } else {
        // Create new item
        $cartItem = Cart::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'product_variant_id' => $request->product_variant_id,
            'quantity' => $quantity,
        ]);
    }

    // Load relationships for response
    $cartItem->load(['product', 'variant.values']);

    return response()->json([
        'success' => true,
        'message' => 'Added to cart',
        'cartItem' => $cartItem,
    ]);
}
    public function fetch()
    {
        $user = Auth::user();

        $cartItems = Cart::with([
            'product',         // eager load product
            'variant.values',
            'variant.values.attribute' // load variant attribute values (color/size)
        ])
        ->where('user_id', $user->id)
        ->get();

        return response()->json([
            'success' => true,
            'cart' => $cartItems,
        ]);
    }

    public function index()
    {
        $user = Auth::user();

        $cartItems = Cart::with([
            'product',         // eager load product
            'variant.values.attribute' // load variant attribute values (color/size)
        ])
        ->where('user_id', $user->id)
        ->get();

        return response()->json([
            'success' => true,
            'cart' => $cartItems,
        ]);
    }
}
