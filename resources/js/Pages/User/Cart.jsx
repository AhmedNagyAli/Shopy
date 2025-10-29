import { usePage, router } from "@inertiajs/react";
import { X, CreditCard, Shield, Lock } from "lucide-react";
import Swal from 'sweetalert2'
import { useState } from "react";

export default function CartPage({ gateways: initialGateways }) {
  console.log(initialGateways);
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
      onError: () => {
        toast.fire({
          icon: "error",
          title: "Failed to remove item",
        });
      },
    });
  };

  const handleUpdateQuantity = (id, type) => {
    router.post(`/cart/items/${id}/update`, { type }, {
      onSuccess: () => {
        window.dispatchEvent(new Event("cart:updated"));
        toast.fire({
          icon: "success",
          title: type === "increase" ? "Quantity increased" : "Quantity decreased",
        });
      },
      onError: () => {
        toast.fire({
          icon: "error",
          title: "Failed to update quantity",
        });
      },
    });
  };

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + (item.variant?.final_price ?? item.product?.price) * item.quantity,
    0
  );

  // ✅ Apply free shipping rule
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const appliedShipping = qualifiesForFreeShipping ? 0 : shippingFee;
  const total = subtotal + appliedShipping;

  // ✅ Open gateway selection modal
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

  // ✅ Handle gateway selection and proceed to payment
  const handleGatewaySelect = (gateway) => {
    setSelectedGateway(gateway);
    setShowGatewayModal(false);
    
    if (gateway.slug === 'cash-on-delivery') {
      // For Cash on Delivery, redirect to order placement page
      router.visit(route('order.create'), {
        data: {
          shipping_fee: appliedShipping,
          total: total,
          payment_gateway: gateway.slug,
          payment_gateway_id: gateway.id
        }
      });
    } else {
      Swal.fire({
                toast: true,
                //position: "top-end",
                icon: "error",
                title: "payment not available for now",
                showConfirmButton: false,
                timer: 2000,
              });
      
      // For other payment methods, proceed to payment final page
      // router.post(
      //   route("order.place"),
      //   { 
      //     shipping_fee: appliedShipping, 
      //     total: total,
      //     payment_gateway: gateway.slug,
      //     payment_gateway_id: gateway.id
      //   },
      //   {
      //     onSuccess: () => {
      //       Swal.fire({
      //         icon: "success",
      //         title: "Redirecting to payment...",
      //         showConfirmButton: false,
      //         timer: 1500,
      //       });
      //     },
      //     onError: (errors) => {
      //       Swal.fire({
      //         icon: "error",
      //         title: "Failed to proceed to payment",
      //         text: errors.message || "Please try again.",
      //       });
      //     },
      //   }
      // );
    }
  };

  // ✅ Get gateway icon based on slug
  const getGatewayIcon = (slug) => {
    const icons = {
      stripe: "💳",
      paypal: "🔵",
      razorpay: "💰",
      'cash-on-delivery': "📦",
      'bank-transfer': "🏦",
      mollie: "🦋",
      square: "⬜",
    };
    return icons[slug] || "💳";
  };

  // ✅ Get gateway description
  const getGatewayDescription = (slug) => {
    const descriptions = {
      stripe: "Pay with credit card via Stripe",
      paypal: "Pay with PayPal account",
      razorpay: "Secure payment with Razorpay",
      'cash-on-delivery': "Pay when you receive your order",
      'bank-transfer': "Direct bank transfer",
      mollie: "European payment solutions",
      square: "Secure payment with Square",
    };
    return descriptions[slug] || "Secure payment";
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200"
              >
                <img
                  src={`/storage/${item.variant?.image || item.product?.main_image || "placeholder.jpg"}`}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                  {item.variant && (
                    <p className="text-sm text-gray-500">
                      {item.variant?.values.map((v) => v.value).join(" / ")}
                    </p>
                  )}
                  <p className="text-gray-700 font-semibold">
                    ${(item.variant?.final_price ?? item.product?.price).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, "decrease")}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, "increase")}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              {qualifiesForFreeShipping ? (
                <span className="text-green-600 font-semibold">Free</span>
              ) : (
                <span>${shippingFee.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {qualifiesForFreeShipping && (
              <p className="text-sm text-green-600 mt-2">
                🎉 Your order will be shipped free
              </p>
            )}

            <button
              onClick={handleCheckoutClick}
              className="mt-4 w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-green-900 transition flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              Proceed to Checkout
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield size={16} />
              <span>Secure payment</span>
              <Lock size={16} />
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Selection Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-1000 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Select Payment Method</h3>
                <button
                  onClick={() => setShowGatewayModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mt-2">Choose how you'd like to pay</p>
            </div>

            {/* Gateway List */}
            <div className="p-6 space-y-3">
              {activeGateways.map((gateway) => (
                <button
                  key={gateway.id}
                  onClick={() => handleGatewaySelect(gateway)}
                  className="w-full p-4 border border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-100 transition-all duration-200 text-left flex items-center gap-4 group"
                >
                  <div className="text-2xl">
                    {getGatewayIcon(gateway.slug)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 group-hover:text-gray-950">
                      {gateway.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getGatewayDescription(gateway.slug)}
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600">
                    →
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Shield size={16} />
                <span>All payments are secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay when processing */}
      {/* {selectedGateway && selectedGateway.slug !== 'cash-on-delivery' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing...
            </h3>
            <p className="text-gray-600">
              Redirecting to {selectedGateway.name} payment
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
}