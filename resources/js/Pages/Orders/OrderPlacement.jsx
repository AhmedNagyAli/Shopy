import { usePage, router } from "@inertiajs/react";
import { ArrowLeft, Package, MapPin, User, CreditCard } from "lucide-react";
import Swal from 'sweetalert2'
import { useState } from "react";

export default function OrderPlacementPage() {
    const { cart = [], settings, auth, addresses, payment_gateway } = usePage().props;
    const [selectedAddressId, setSelectedAddressId] = useState(addresses?.[0]?.id || '');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const shippingFee = parseFloat(settings?.shipping_fee || 0);
    const freeShippingThreshold = parseFloat(settings?.free_shipping_thershold || 0);

    const subtotal = cart.reduce(
        (sum, item) => sum + (item.variant?.final_price ?? item.product?.price) * item.quantity,
        0
    );

    const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
    const appliedShipping = qualifiesForFreeShipping ? 0 : shippingFee;
    const total = subtotal + appliedShipping;

    const handleSubmitOrder = async () => {
        if (!selectedAddressId) {
            Swal.fire({
                icon: 'error',
                title: 'Address Required',
                text: 'Please select a shipping address.',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await router.post(route('order.store'), {
                shipping_fee: appliedShipping,
                total: total,
                payment_gateway: payment_gateway?.slug,
                payment_gateway_id: payment_gateway?.id,
                user_address_id: selectedAddressId,
                notes: notes,
                subtotal: subtotal,
                discount: 0, // You can add discount logic if needed
                tax: 0, // You can add tax logic if needed
            }, {
                onSuccess: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Order Placed Successfully!',
                        html: `
                            <div class="text-center">
                                <p class="mb-4">Your order has been placed successfully.</p>
                                <p class="text-sm text-gray-600">You will pay <strong>$${total.toFixed(2)}</strong> when you receive your order.</p>
                            </div>
                        `,
                        confirmButtonText: 'View Orders',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            router.visit(route('orders.index'));
                        }
                    });
                },
                onError: (errors) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed to Place Order',
                        text: errors.message || 'Please try again.',
                    });
                },
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Something went wrong',
                text: 'Please try again later.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToCart = () => {
        router.visit(route('cart.index'));
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={handleBackToCart}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Complete Your Order</h1>
                    <p className="text-gray-600">Cash on Delivery - Pay when you receive</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Order Details */}
                <div className="space-y-6">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="text-blue-600" size={20} />
                            <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                        </div>
                        
                        {addresses && addresses.length > 0 ? (
                            <div className="space-y-3">
                                {addresses.map((address) => (
                                    <label key={address.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                        <input
                                            type="radio"
                                            name="address"
                                            value={address.id}
                                            checked={selectedAddressId === address.id}
                                            onChange={(e) => setSelectedAddressId(e.target.value)}
                                            className="mt-1 text-blue-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {address.first_name} {address.last_name}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {address.address_line_1}
                                                {address.address_line_2 && `, ${address.address_line_2}`}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {address.city}, {address.state} {address.zip_code}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {address.country}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                📞 {address.phone}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <MapPin size={48} className="mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-600 mb-4">No addresses found</p>
                                <button
                                    onClick={() => router.visit(route('addresses.create'))}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Add Address
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order Notes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special instructions for your order..."
                            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            maxLength={500}
                        />
                        <div className="text-sm text-gray-500 text-right mt-1">
                            {notes.length}/500
                        </div>
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <img
                                        src={`/storage/${item.variant?.image || item.product?.main_image || "placeholder.jpg"}`}
                                        alt={item.product?.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 text-sm">
                                            {item.product?.name}
                                        </h3>
                                        {item.variant && (
                                            <p className="text-xs text-gray-500">
                                                {item.variant?.values.map((v) => v.value).join(" / ")}
                                            </p>
                                        )}
                                        <p className="text-gray-700 font-semibold text-sm">
                                            ${(item.variant?.final_price ?? item.product?.price).toFixed(2)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-gray-900 font-semibold">
                                        ${((item.variant?.final_price ?? item.product?.price) * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                {qualifiesForFreeShipping ? (
                                    <span className="text-green-600 font-semibold">Free</span>
                                ) : (
                                    <span>${shippingFee.toFixed(2)}</span>
                                )}
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Amount</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Cash on Delivery Info */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                                <Package className="text-blue-600" size={20} />
                                <div>
                                    <div className="font-semibold text-blue-900">Cash on Delivery</div>
                                    <div className="text-sm text-blue-700">
                                        You'll pay ${total.toFixed(2)} when you receive your order
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmitOrder}
                            disabled={isSubmitting || !selectedAddressId}
                            className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Placing Order...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={20} />
                                    Place Order
                                </>
                            )}
                        </button>

                        {!selectedAddressId && (
                            <p className="text-red-600 text-sm text-center mt-2">
                                Please select a shipping address to continue
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}