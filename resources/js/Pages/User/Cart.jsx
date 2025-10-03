import { usePage, router } from "@inertiajs/react";
import { X } from "lucide-react";
import Swal from 'sweetalert2'

export default function CartPage() {
  const { cart = [], settings } = usePage().props;
  const shippingFee = parseFloat(settings?.shipping_fee || 0);
  const toast = Swal.mixin({
  toast: true,
  position: "top-end", // top corner
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
  const total = subtotal + shippingFee;

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
              <span>${shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="mt-4 w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-green-900 transition">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
