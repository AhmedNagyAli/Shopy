import React from 'react';
import MainLayout from '../../Layouts/MainLayout';

export default function Home({ products, categories }) {
    return (
        <MainLayout>
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Featured Products</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                        {/* Product Image */}
                        <div className="relative overflow-hidden aspect-square">
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Quick action overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {product.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {product.description}
                            </p>
                            
                            {/* Price and Rating */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl font-bold text-gray-900">
                                    ${product.price}
                                </span>
                                {product.rating && (
                                    <div className="flex items-center space-x-1">
                                        <span className="text-yellow-400">★</span>
                                        <span className="text-sm text-gray-600">{product.rating}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Add to Cart Button */}
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </MainLayout>
    );
}