import { usePage, router } from "@inertiajs/react";
import { X, CreditCard, Shield, Lock, Minus, Plus, Truck } from "lucide-react";
import Swal from 'sweetalert2'
import { useState } from "react";

export default function CartPage({ gateways: initialGateways }) {
  const { cart = [], settings } = usePage().props;

  const shippingFee = parseFloat(settings?.shipping_fee || 0);
  const freeShippingThreshold = parseFloat(settings?.free_shipping_thershold || 0);

  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);

  // Filter only active gateways
  const activeGateways = initialGateways?.filter(gateway => gateway.is_active) || [];

  const toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleRemove = (id) => {
    router.delete(`/cart/items/${id}`, {
      onSuccess: () => {
        window.dispatchEvent(new Event("cart:updated"));
        toast.fire({
          icon: "success",
          title: "Item removed from cart",
        });
      },
      onError: () =>
        toast.fire({
          icon: "error",
          title: "Failed to remove item",
        }),
    });
  };

  const handleUpdateQuantity = (id, type) => {
    router.post(
      `/cart/items/${id}/update`,
      { type },
      {
        onSuccess: () => {
          window.dispatchEvent(new Event("cart:updated"));
          toast.fire({
            icon: "success",
            title: type === "increase" ? "Quantity increased" : "Quantity decreased",
          });
        },
        onError: () =>
          toast.fire({
            icon: "error",
            title: "Failed to update quantity",
          }),
      }
    );
  };

  // ⭐ FIXED: Use discounted price from backend
  const subtotal = cart.reduce(
    (sum, item) => sum + item.final_price * item.quantity,
    0
  );

  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const appliedShipping = qualifiesForFreeShipping ? 0 : shippingFee;
  const total = subtotal + appliedShipping;

  const handleCheckoutClick = () => {
    if (activeGateways.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Payment Methods",
        text: "There are no payment methods available at the moment.",
      });
      return;
    }
    setShowGatewayModal(true);
  };

  const handleGatewaySelect = (gateway) => {
    setSelectedGateway(gateway);
    setShowGatewayModal(false);

    if (gateway.slug === "cash-on-delivery") {
      router.visit(route("order.create"), {
        data: {
          shipping_fee: appliedShipping,
          total: total,
          payment_gateway: gateway.slug,
          payment_gateway_id: gateway.id,
        },
      });
    } else if (gateway.slug === 'stripe') {
  router.post(route('stripe.create'), {
      shipping_fee: appliedShipping,
      total: total
  }, {
      onSuccess: (res) => {
          const sessionId = res.id; // session.id from backend
          const stripe = Stripe(import.meta.env.VITE_STRIPE_KEY);
          stripe.redirectToCheckout({ sessionId });
      },
      onError: () => {
          Swal.fire({
              icon: "error",
              title: "Stripe error",
          });
      }
  });
}else{
    Swal.fire({
        toast: true,
        icon: "error",
        title: "payment not available for now",
        showConfirmButton: false,
        timer: 2000,
      });
    }

  };

  const getGatewayIcon = (slug) => {
    const icons = {
      stripe: "💳",
      paypal: "🔵",
      razorpay: "💰",
      "cash-on-delivery": "📦",
      "bank-transfer": "🏦",
      mollie: "🦋",
      square: "⬜",
    };
    return icons[slug] || "💳";
  };

  const getGatewayDescription = (slug) => {
    const descriptions = {
      stripe: "Pay with credit card via Stripe",
      paypal: "Pay with PayPal account",
      razorpay: "Secure payment with Razorpay",
      "cash-on-delivery": "Pay when you receive your order",
      "bank-transfer": "Direct bank transfer",
      mollie: "European payment solutions",
      square: "Secure payment with Square",
    };
    return descriptions[slug] || "Secure payment";
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {/* Mobile Back Button */}
<div className="flex items-center mb-4">
  <button
    onClick={() => window.history.back()}
    className="p-2 rounded-full hover:bg-gray-200 transition"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  </button>

  <span className="text-xl font-semibold ml-2">Back</span>
</div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
        <p className="text-gray-600 mt-2">
          {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Truck className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Looks like you haven't added any items to your cart yet.
          </p>
          <a
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 text-black font-bold rounded-lg ransition-colors duration-200"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200"
              >
                {/* Product Image */}
                <div className="flex-shrink-0 w-full sm:w-24 h-24 mx-auto sm:mx-0 rounded-lg overflow-hidden">
                  <img
                    src={`/storage/${item.variant?.image || item.product?.main_image || "placeholder.jpg"}`}
                    alt={item.product?.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  {/* Product Name with proper truncation */}
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight break-words line-clamp-2 mb-1">
                    {item.product?.name}
                  </h3>


                  {/* Variant Info */}
                  {item.variant && (
                    <p className="text-sm text-gray-600 mb-2">
                      {item.variant.values.map((v) => v.value).join(" / ")}
                    </p>
                  )}

                  {/* Price */}
                  <p className="text-lg font-bold text-gray-900">
                    ${item.final_price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-4 sm:mt-0">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, "decrease")}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all duration-200"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, "increase")}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all duration-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Remove item"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary - Sticky on desktop */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 h-fit">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Order Summary</h2>

              {/* Progress Bar for Free Shipping */}
              {freeShippingThreshold > 0 && (
                <div className="mb-4 sm:mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      {qualifiesForFreeShipping ? "🎉 Free shipping unlocked!" : `Add $${(freeShippingThreshold - subtotal).toFixed(2)} for free shipping`}
                    </span>
                    <span className="font-medium">
                      ${subtotal.toFixed(2)} / ${freeShippingThreshold.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {qualifiesForFreeShipping ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    <span>${shippingFee.toFixed(2)}</span>
                  )}
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between font-bold text-gray-900 text-lg sm:text-xl">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="mt-2 w-full bg-zinc-900 text-white py-3 sm:py-4 hover:bg-green-950 transition-colors duration-200 font-semibold flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                <CreditCard size={20} />
                Proceed to Checkout
              </button>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield size={16} />
                <span>Secure payment</span>
                <Lock size={16} />
              </div>

              {/* Continue Shopping Link */}
              <div className="mt-4 text-center">
                <a
                  href="/"
                  className="text-zinc-700 hover:text-zinc-900 font-medium text-sm transition-colors duration-200"
                >
                  ← Continue Shopping
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select Payment Method</h3>
                <button
                  onClick={() => setShowGatewayModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Choose how you'd like to pay</p>
            </div>

            <div className="p-4 sm:p-6 space-y-3">
              {activeGateways.map((gateway) => (
                <button
                  key={gateway.id}
                  onClick={() => handleGatewaySelect(gateway)}
                  className="w-full p-4 border border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 text-left flex items-center gap-4 group"
                >
                  <div className="text-2xl flex-shrink-0">{getGatewayIcon(gateway.slug)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-base truncate">
                      {gateway.name}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {getGatewayDescription(gateway.slug)}
                    </div>
                  </div>

                  <div className="text-gray-400 group-hover:text-gray-600 flex-shrink-0">→</div>
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Shield size={16} />
                <span>All payments are secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}