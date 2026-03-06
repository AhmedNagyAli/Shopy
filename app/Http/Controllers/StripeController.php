<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Order;
use App\Models\Cart;
use Inertia\Inertia;

class StripeController extends Controller
{
    public function createCheckoutSession(Request $request)
{
    Stripe::setApiKey(env('STRIPE_SECRET'));

    $user = auth()->user();
    $addresses = $user->addresses;

    if ($addresses->isEmpty()) {
        return redirect()->route('addresses.create')
            ->with('warning', 'Please add a shipping address before placing an order.');
    }

    $defaultAddress = $addresses->where('is_default', true)->first() ?? $addresses->first();

    $cartItems = Cart::with(['product.discounts', 'variant.discounts', 'variant.values.attribute'])
        ->where('user_id', $user->id)
        ->get();

    if ($cartItems->isEmpty()) {
        return back()->withErrors(['cart' => 'Your cart is empty']);
    }

    // Helper to calculate discounts
    $applyDiscount = function ($price, $discount) {
        if (!$discount) return $price;
        if ($discount->type === 'percentage') {
            return max($price - ($price * $discount->value / 100), 0);
        } elseif ($discount->type === 'fixed') {
            return max($price - $discount->value, 0);
        }
        return $price;
    };

    $subtotal = 0;
    $totalDiscount = 0;

    // Create order record
    $order = Order::create([
        'user_id'          => $user->id,
        'user_address_id'  => $defaultAddress->id,
        'order_number'     => 'ORD-' . strtoupper(uniqid()),
        'subtotal'         => 0,
        'discount'         => 0,
        'tax'              => 0,
        'shipping_cost'    => $request->shipping_fee ?? 0,
        'total_amount'     => 0,
        'payment_status'   => 'pending',
        'payment_method'   => 'stripe',
        'transaction_id'   => null,
        'shipping_status'  => 'pending',
        'tracking_number'  => null,
        'carrier'          => null,
        'status'           => 'processing',
        'notes'            => null,
    ]);

    $lineItems = [];

    foreach ($cartItems as $item) {
        $variant = $item->variant;
        $product = $item->product;
        $quantity = $item->quantity;

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

        $lineTotal = $finalPrice * $quantity;
        $lineDiscount = ($basePrice - $finalPrice) * $quantity;

        $subtotal += $lineTotal;
        $totalDiscount += $lineDiscount;
        
        $lineItems[] = [
            'price_data' => [
                'currency' => 'egp',
                'product_data' => ['name' => $product->name],
                'unit_amount' => intval($finalPrice * 100),
            ],
            'quantity' => $quantity,
        ];
        if ($variant) {
        // Reduce variant stock
        $variant->decrement('stock', $quantity);
        } 

        // Optionally, create order items if you track them
        $order->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant?->id,
            'product_name' => $product->name,
            'variant_values' => $variant?->values?->map(fn($v) => [
                'attribute' => $v->attribute?->name,
                'value' => $v->value,
            ])->values() ?? [],
            'quantity' => $quantity,
            'unit_price' => $finalPrice,
            'discount' => $lineDiscount,
            'tax' => 0,
            'total' => $lineTotal,
        ]);
    }

    $shipping = (float) $request->shipping_fee ?? 0;
    $total = $subtotal + $shipping;
    

    $order->update([
        'subtotal'      => $subtotal,
        'discount'      => $totalDiscount,
        'total_amount'  => $total,
    ]);
    $session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => $lineItems,
        'mode' => 'payment',
        'success_url' => route('stripe.success', ['order' => $order->id]),
        'cancel_url' => route('stripe.cancel'),
    ]);

    // Redirect using Inertia to avoid JSON errors
    return Inertia::location($session->url);
}



    public function success(Order $order)
{
    $order->update(['payment_status' => 'paid']);
    Cart::where('user_id', auth()->id())->delete();
    return redirect()->route('orders.index')->with('success', 'Payment Successful!');

    //return Inertia::render('Order/Success', ['order' => $order]);
}

public function cancel()
{
    return redirect()->route('cart.index')
                     ->with('error', 'Payment was canceled.');
}

}
