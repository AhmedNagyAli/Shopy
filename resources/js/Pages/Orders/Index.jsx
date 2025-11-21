import { Link } from "@inertiajs/react";
import { Package, Truck, CreditCard, ChevronRight, Calendar, Hash } from "lucide-react";

export default function OrdersIndex({ orders = [] }) {
  // Status colors mapping
  const statusColors = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  const getStatusColor = (status) => {
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Orders
            </h1>
          </div>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-600 mb-4 text-lg">You haven't placed any orders yet.</p>
            <Link
              href={route("shop.index")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Shopping
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100/50">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Hash className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Order Number</p>
                        <p className="font-bold text-gray-900 text-lg">{order.order_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium capitalize ${getStatusColor(order.shipping_status)}`}>
                        {order.shipping_status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100/50">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-6 hover:bg-blue-50/30 transition-colors duration-200 group/item"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <img
                            src={
                              item.product?.main_image
                                ? `/storage/${item.product.main_image}`
                                : "/images/placeholder.jpg"
                            }
                            alt={item.product?.name}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm group-hover/item:scale-105 transition-transform duration-200"
                          />
                          {item.discount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -${item.discount}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <Link
                            href={route("products.show", item.product?.slug)}
                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {item.product_name}
                          </Link>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                              Qty: {item.quantity}
                            </p>

                            {item.variant_values?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.variant_values.map((v, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md"
                                  >
                                    {v.attribute}: {v.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${item.total}
                        </p>
                        {item.original_price > item.total && (
                          <p className="text-sm text-gray-500 line-through">
                            ${item.original_price}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/50 border-t border-blue-100/50">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                        <CreditCard className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-gray-700 capitalize">
                          {order.payment_method.replace(/-/g, " ")}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                        <Truck className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-700 capitalize">
                          {order.shipping_method || "Standard"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${order.total_amount}
                        </p>
                      </div>
                      
                      <Link
                        href={route("orders.index", order.id)}
                        className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg group/link"
                      >
                        <span className="font-medium">Details</span>
                        <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold">
                    ${orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2)}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Delivered</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(order => order.shipping_status === 'delivered').length}
                  </p>
                </div>
                <Truck className="w-8 h-8 text-emerald-200" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}