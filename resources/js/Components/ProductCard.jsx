import React from 'react';
import { Link } from '@inertiajs/react';

export default function ProductCard({ product }) {
    const image = product.main_image || product.image_url || '/images/product-placeholder.png';
    const price = product.price ?? 0;

    return (
        <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition duration-200 overflow-hidden flex flex-col">
            <Link href="">
                {/* Image */}
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                        loading="lazy"
                    />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {product.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-indigo-600">
                            ${Number(price).toFixed(2)}
                        </span>
                        <Link
                            href=""
                            className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            View
                        </Link>
                    </div>
                </div>
            </Link>
        </article>
    );
}
