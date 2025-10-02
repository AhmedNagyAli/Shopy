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

        // Check if already in wishlist
        $existing = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->where('product_variant_id', $request->product_variant_id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Item already in wishlist'], 409);
        }

        // Get selected attributes if variant is selected
        $attributes = [];
        if ($request->product_variant_id) {
            $variant = ProductVariant::with([
                'values',
                'values.attribute'
            ])->find($request->product_variant_id);
            if ($variant) {
                foreach ($variant->values as $value) {
                    $attributes[$value->attribute->name] = $value->value;
                }
            }
        }

        $wishlist = Wishlist::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'product_variant_id' => $request->product_variant_id,
            'attributes' => $attributes,
        ]);

        return response()->json([
            'message' => 'Added to wishlist',
            'wishlist' => $wishlist->load('product', 'variant')
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