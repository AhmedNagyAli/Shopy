<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    public function store(Request $request)
{
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

        $cart = Cart::with([
            'product',         // eager load product
            'variant.values',
            'variant.values.attribute' // load variant attribute values (color/size)
        ])
        ->where('user_id', $user->id)
        ->get();       

        return Inertia::render('User/Cart', [
            'cart' => $cart,
            
        ]);
    }
    // Update quantity
    public function update(Request $request, $id)
{
    $request->validate([
        'type' => 'required|in:increase,decrease',
    ]);

    $item = Cart::where('id', $id)
        ->where('user_id', Auth::id())
        ->firstOrFail();

    if ($request->type === 'increase') {
    $item->quantity += 1;
    $item->save();
    return back()->with('success', 'Quantity increased');
} elseif ($request->type === 'decrease') {
    if ($item->quantity > 1) {
        $item->quantity -= 1;
        $item->save();
        return back()->with('success', 'Quantity decreased');
    } else {
        $item->delete();
        return back()->with('success', 'Item removed');
    }
}


    return back()->with('success', 'Cart updated successfully.');
}


    // Remove item
    public function destroy(Request $request, $id)
    {
        $item = Cart::where('id',$id)
        ->where('user_id',Auth::user()->id)
        ->firstOrFail();
        $item->delete();
        

        return back()->with('success', 'Item removed from cart.');
    }
}
