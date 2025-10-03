<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        //stopping here for some days
         logger($request->all());
    //     $user = Auth::user();

    //     $request->validate([
    //         'user_address_id' => 'required|exists:user_addresses,id',
    //         'payment_method' => 'nullable|string',
    //     ]);

    //     // Assume you have settings helper
    //     $settings = settings();
    //     $shippingFee = (float) $settings['shipping_fee'] ?? 0;
    //     $freeThreshold = (float) $settings['free_shipping_threshold'] ?? 0;

    //     $cartItems = Cart::with(['product', 'variant.values.attribute'])
    //         ->where('user_id', $user->id)
    //         ->get();

    //     if ($cartItems->isEmpty()) {
    //         return back()->with('error', 'Your cart is empty.');
    //     }

    //     // Calculate totals
    //     $subtotal = $cartItems->sum(function ($item) {
    //         return ($item->variant->final_price ?? $item->product->price) * $item->quantity;
    //     });

    //     $appliedShipping = $subtotal >= $freeThreshold ? 0 : $shippingFee;
    //     $total = $subtotal + $appliedShipping;

    //     // Generate unique order number
    //     $orderNumber = 'ORD-' . now()->format('Y') . '-' . str_pad(Order::count() + 1, 4, '0', STR_PAD_LEFT);

    //     DB::transaction(function () use ($user, $request, $orderNumber, $subtotal, $appliedShipping, $total, $cartItems) {
    //         // Create order
    //         $order = Order::create([
    //             'user_id' => $user->id,
    //             'user_address_id' => $request->user_address_id,
    //             'order_number' => $orderNumber,
    //             'subtotal' => $subtotal,
    //             'discount' => 0,
    //             'tax' => 0,
    //             'shipping_cost' => $appliedShipping,
    //             'total_amount' => $total,
    //             'payment_method' => $request->payment_method,
    //             'status' => 'pending',
    //             'payment_status' => 'pending',
    //             'shipping_status' => 'pending',
    //         ]);

    //         // Create order items
    //         foreach ($cartItems as $item) {
    //             $price = $item->variant->final_price ?? $item->product->price;
    //             $variantValues = $item->variant?->values?->map(fn($v) => [
    //                 $v->attribute->name => $v->value
    //             ])->collapse()->toArray();

    //             OrderItem::create([
    //                 'order_id' => $order->id,
    //                 'product_id' => $item->product_id,
    //                 'product_variant_id' => $item->product_variant_id,
    //                 'product_name' => $item->product->name,
    //                 'variant_values' => $variantValues,
    //                 'quantity' => $item->quantity,
    //                 'unit_price' => $price,
    //                 'discount' => 0,
    //                 'tax' => 0,
    //                 'total' => $price * $item->quantity,
    //             ]);
    //         }

    //         // Clear cart
    //         Cart::where('user_id', $user->id)->delete();
    //     });

    //     return redirect()->route('orders.index')->with('success', 'Order placed successfully!');
    // }
}
}