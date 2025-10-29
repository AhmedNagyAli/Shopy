import { Link } from "@inertiajs/react";
import { Package, Truck, CreditCard, ChevronRight } from "lucide-react";

export default function OrdersIndex({ orders = [] }) {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">You haven’t placed any orders yet.</p>
            <Link
              href={route("shop.index")}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-semibold text-gray-900">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-800">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-5 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            item.product?.main_image
                              ? `/storage/${item.product.main_image}`
                              : "/images/placeholder.jpg"
                          }
                          alt={item.product?.name}
                          className="w-16 h-16 rounded-md object-cover border border-gray-200"
                        />

                        <div>
                          <Link
                            href={route("products.show", item.product?.slug)}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>

                          {item.variant_values?.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.variant_values
                                .map(
                                  (v) => `${v.attribute}: ${v.value}`
                                )
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-gray-900 font-semibold">
                          ${item.total}
                        </p>
                        {item.discount > 0 && (
                          <p className="text-xs text-gray-500">
                            -${item.discount} discount
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>{order.payment_method.replace(/-/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span className="capitalize">{order.shipping_status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      Total: ${order.total_amount}
                    </p>
                    <Link
                      href={route("orders.index", order.id)}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
