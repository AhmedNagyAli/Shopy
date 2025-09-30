// resources/js/Components/ProductCard.jsx
import { Link } from '@inertiajs/react';

export default function ProductCard({ product }) {
    return (
        <Link
            href={route('products.show', product.slug)} // ✅ sends to product show route
            className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group hover:border-gray-200"
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                    src={product.main_image ? `/storage/${product.main_image}` : '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Quick Actions Overlay */}
                <div
                    onClick={(e) => e.preventDefault()} // prevents link navigation when clicking heart
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2"
                >
                    <button className="bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition-colors">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={(e) => e.preventDefault()} // ✅ prevent navigation
                    className="absolute bottom-3 right-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Category */}
                {product.category && (
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        {product.category}
                    </p>
                )}

                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                    {product.name}
                </h3>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-3 h-3 ${star <= Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs text-gray-600">{product.rating}</span>
                        {product.review_count && (
                            <span className="text-xs text-gray-500">({product.review_count})</span>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">${product.original_price}</span>
                    )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                    {product.is_new && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">New</span>
                    )}
                    {product.is_best_seller && (
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Best Seller</span>
                    )}
                    {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Low Stock</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
