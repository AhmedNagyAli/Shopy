import React from "react";
import { Head } from "@inertiajs/react";
import ProductCard from "@/Components/ProductCard";
import MainLayout from "@/Layouts/MainLayout";

export default function Results({ query, products, categories, settings, menCategories, womenCategories,topCategories }) {
  return (
    <MainLayout categories={categories}
     settings={settings}
     menCategories={menCategories}
                womenCategories={womenCategories}
                topCategories={topCategories}>
      <Head title={`Search results for "${query}"`} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Search results for: <span className="text-blue-600">"{query}"</span>
        </h1>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No products found matching your search.
          </p>
        )}
      </div>
    </MainLayout>
  );
}
