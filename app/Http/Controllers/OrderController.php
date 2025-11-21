<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{

    public function index()
    {
        $user = Auth::user();

        $orders = Order::with([
            'items.product:id,name,main_image,slug',
            'items.variant.values.attribute',
            'address.city',
            'address.country',
        ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }


    public function store(Request $request)
    {
        //stopping here for some days
         logger($request->all());
    }

    public function create(Request $request)
{
    if ($request->payment_gateway) {

        switch ($request->payment_gateway) {

            case 'cash-on-delivery':
                return $this->cashOnDelivery($request);

            default:
                return back()->with('error', 'Invalid payment method');
        }

    }

    return back()->with('error', 'Payment gateway is required.');
}

private function cashOnDelivery(Request $request){
    $user = Auth::user();
    $addresses = $user->addresses;
    if ($addresses->isEmpty()) {
        // Redirect to address creation page
        return redirect()
            ->route('addresses.create')
            ->with('warning', 'Please add a shipping address before placing an order.');
    }
    $defaultAddress = $addresses->where('is_default', true)->first() ?? $addresses->first();
    $cartItems = $user->cart()
        ->with(['product.discounts', 'variant.discounts', 'variant.values.attribute'])
        ->get();
    if ($cartItems->isEmpty()) {
        return back()->with('error', 'Your cart is empty.');
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

    // Create Order Record
    $order = \App\Models\Order::create([
        'user_id'          => $user->id,
        'user_address_id'  => $defaultAddress->id,
        'order_number'     => 'ORD-' . strtoupper(uniqid()),
        'subtotal'         => 0,
        'discount'         => 0,
        'tax'              => 0,
        'shipping_cost'    => $request->shipping_fee ?? 0,
        'total_amount'     => 0,
        'payment_status'   => 'pending',
        'payment_method'   => $request->payment_gateway,
        'transaction_id'   => null,
        'shipping_status'  => 'pending',
        'tracking_number'  => null,
        'carrier'          => null,
        'status'           => 'processing',
        'notes'            => null,
    ]);


    foreach ($cartItems as $item) {
    $variant = $item->variant;
    $product = $item->product;
    $quantity = $item->quantity;

    $basePrice = $variant ? $variant->price : $product->price;

    // Active discounts
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

    // ⭐⭐⭐ STOCK REDUCTION ⭐⭐⭐
    if ($variant) {
        // Reduce variant stock
        $variant->decrement('stock', $quantity);
    } 

    // Create order item
    $order->items()->create([
        'product_id'         => $product->id,
        'product_variant_id' => $variant?->id,
        'product_name'       => $product->name,
        'variant_values'     => $variant?->values?->map(fn($v) => [
            'attribute' => $v->attribute?->name,
            'value'     => $v->value,
        ])->values() ?? [],
        'quantity'           => $quantity,
        'unit_price'         => $finalPrice,
        'discount'           => $lineDiscount,
        'tax'                => 0,
        'total'              => $lineTotal,
    ]);
}

    $shipping = (float) $request->shipping_fee ?? 0;
    $total = $subtotal + $shipping;

    $order->update([
        'subtotal'      => $subtotal,
        'discount'      => $totalDiscount,
        'total_amount'  => $total,
    ]);

    $user->cart()->delete();
    return redirect()
        ->route('orders.index', $order->id)
        ->with('success', 'Order created successfully.');

}


}