<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function store(Request $request)
{
    $request->validate([
        'product_id' => 'required|exists:products,id',
        'product_variant_id' => 'nullable|exists:product_variants,id',
    ]);

    // Check if this product/variant is already in wishlist
    $exists = Wishlist::where('user_id', Auth::id())
        ->where('product_id', $request->product_id)
        ->when($request->product_variant_id, function ($q) use ($request) {
            $q->where('product_variant_id', $request->product_variant_id);
        })
        ->exists();

    if ($exists) {
        return response()->json([
            'success' => false,
            'message' => 'This item is already in your wishlist.',
        ], 200);
    }

    // Otherwise create new wishlist entry
    $wishlistItem = Wishlist::create([
        'user_id' => Auth::id(),
        'product_id' => $request->product_id,
        'product_variant_id' => $request->product_variant_id,
        'attributes' => $request->attributes ?? [],
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Added to wishlist',
        'wishlistItem' => $wishlistItem,
    ]);
}


    public function destroy($id)
    {
        $wishlist = Wishlist::where('user_id', Auth::id())->findOrFail($id);
        $wishlist->delete();

        return response()->json(['message' => 'Removed from wishlist']);
    }

    public function index()
    {
        $wishlists = Wishlist::with(['product', 'variant'])
            ->where('user_id', Auth::id())
            ->get();

        return response()->json($wishlists);
    }
}