<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function toggle(Request $request)
{
    $request->validate([
        'product_id' => 'required|exists:products,id',
        'product_variant_id' => 'nullable|exists:product_variants,id',
    ]);

    $wishlistItem = Wishlist::where('user_id', Auth::id())
        ->where('product_id', $request->product_id)
        ->when($request->product_variant_id, function ($q) use ($request) {
            $q->where('product_variant_id', $request->product_variant_id);
        })
        ->first();

    if ($wishlistItem) {
        $wishlistItem->delete();
        return response()->json([
            'success' => true,
            'action' => 'removed',
            'message' => 'Removed from wishlist',
        ]);
    }

    $wishlistItem = Wishlist::create([
        'user_id' => Auth::id(),
        'product_id' => $request->product_id,
        'product_variant_id' => $request->product_variant_id,
        'attributes' => $request->attributes ?? [],
    ]);

    return response()->json([
        'success' => true,
        'action' => 'added',
        'message' => 'Added to wishlist',
        'wishlistItem' => $wishlistItem,
    ]);
}

    // WishlistController.php
public function userWishlist()
{
    $wishlist = Wishlist::where('user_id', Auth::id())
        ->pluck('product_variant_id')
        ->toArray(); // just return variant IDs for simplicity

    return response()->json([
        'success' => true,
        'wishlist' => $wishlist,
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