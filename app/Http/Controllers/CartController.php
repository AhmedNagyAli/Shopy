<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\PaymentGateway;
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
     public function getCartItems(Request $request)
    {
        $user = Auth::user();    
        if (!$user) {
            return response()->json(['cart' => []]);
        }

        $applyDiscount = function ($price, $discount) {
    if (!$discount) return $price;
    if ($discount->type === 'percentage') {
        return max($price - ($price * $discount->value / 100), 0);
    } elseif ($discount->type === 'fixed') {
        return max($price - $discount->value, 0);
    }
    return $price;
};

$cartItems = $user->cart()
    ->with(['product.discounts', 'variant.discounts', 'variant.values.attribute'])
    ->get()
    ->map(function ($item) use ($applyDiscount) {

        $variant = $item->variant;
        $product = $item->product;

        $basePrice = $variant ? $variant->price : $product->price;

        $variantDiscount = $variant?->discounts?->where('is_active', true)?->first();
        $productDiscount = $product?->discounts?->where('is_active', true)?->first();

        if ($variantDiscount) {
            $finalPrice = $applyDiscount($basePrice, $variantDiscount);
        } elseif ($productDiscount) {
            $finalPrice = $applyDiscount($basePrice, $productDiscount);
        } else {
            $finalPrice = $variant?->final_price ?? $basePrice;
        }

        return [
            'id' => $item->id,
            'quantity' => $item->quantity,
            'product' => $product,
            'variant' => $variant,
            'final_price' => $finalPrice, // ⭐ SEND PRICE AFTER DISCOUNT
        ];
    });

return response()->json([
    'cart' => $cartItems
]);
    }

    public function index()
{
    $gateways = PaymentGateway::where('is_active', true)->get();
    $user = Auth::user();

    $applyDiscount = function ($price, $discount) {
        if (!$discount) return $price;

        if ($discount->type === 'percentage') {
            return max($price - ($price * $discount->value / 100), 0);
        }

        if ($discount->type === 'fixed') {
            return max($price - $discount->value, 0);
        }

        return $price;
    };

    $cart = Cart::with([
        'product.discounts',
        'variant.discounts',
        'variant.values',
        'variant.values.attribute'
    ])
    ->where('user_id', $user->id)
    ->get()
    ->map(function ($item) use ($applyDiscount) {

        $variant = $item->variant;
        $product = $item->product;

        // Base price (variant overrides product)
        $basePrice = $variant ? $variant->price : $product->price;

        // Get discounts
        $variantDiscount = $variant?->discounts?->where('is_active', true)?->first();
        $productDiscount = $product?->discounts?->where('is_active', true)?->first();

        // Apply discount priority: Variant > Product
        if ($variantDiscount) {
            $finalPrice = $applyDiscount($basePrice, $variantDiscount);
        } elseif ($productDiscount) {
            $finalPrice = $applyDiscount($basePrice, $productDiscount);
        } else {
            $finalPrice = $variant?->final_price ?? $basePrice;
        }

        // Attach final_price to return
        $item->final_price = $finalPrice;

        return $item;
    });

    return Inertia::render('User/Cart', [
        'cart' => $cart,
        'gateways' => $gateways,
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
