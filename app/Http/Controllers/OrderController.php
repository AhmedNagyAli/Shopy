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
    public function index(Request $request){
        dump($request);

    }
    public function store(Request $request)
    {
        //stopping here for some days
         logger($request->all());
    }
    public function create(Request $request)
    {
        $user = $request->user();
        $cart = $user->cart;
        logger($cart);

        

        

        // ✅ Pass frontend data
        // return Inertia::render('Order/Create', [
        //     'cart' => $cartItems,
        //     'shipping_fee' => $request->shipping_fee,
        //     'total' => $request->total,
        //     'payment_gateway' => $request->payment_gateway,
        //     'payment_gateway_id' => $request->payment_gateway_id,
        //     'settings' => $settings,
        // ]);
    }
}