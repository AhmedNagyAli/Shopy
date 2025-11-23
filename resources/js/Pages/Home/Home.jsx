import { useState } from "react";
import { usePage } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import ProductCard from "../../Components/ProductCard";
import Header from "../../Components/Header";

export default function Home({ topProducts, menProducts, womenProducts, categories, menCategories, womenCategories,topCategories }) {
    
    const { settings } = usePage().props;

    const createSlider = (products) => {
        const itemsPerPage = 8; // 2 rows × 4 columns
        const totalPages = Math.ceil(products.length / itemsPerPage);
        const [page, setPage] = useState(0);

        return {
            itemsPerPage,
            totalPages,
            page,
            nextPage: () => page < totalPages - 1 && setPage(page + 1),
            prevPage: () => page > 0 && setPage(page - 1),
            setPage,
        };
    };

    const top = createSlider(topProducts, 8);
    const men = createSlider(menProducts, 8);
    const women = createSlider(womenProducts, 8);

    const renderSlider = (title, slider, products) => (
  <section className="mt-16">
    <h2 className="text-3xl font-bold mb-6 text-gray-900">{title}</h2>

    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500"
        style={{
          transform: `translateX(-${slider.page * 100}%)`,
          width: `${slider.totalPages * 100}%`,
        }}
      >
        {Array.from({ length: slider.totalPages }).map((_, pageIndex) => (
          <div
            key={pageIndex}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 py-4 w-full flex-shrink-0"
          >
            {products
              .slice(pageIndex * slider.itemsPerPage, (pageIndex + 1) * slider.itemsPerPage)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={slider.prevPage}
        disabled={slider.page === 0}
        className="absolute top-1/2 left-3 -translate-y-1/2 
          bg-black text-white shadow-xl w-14 h-14 flex items-center justify-center 
          rounded-full border border-white/40
          hover:bg-gray-800 hover:scale-110 transition-all duration-300
          disabled:opacity-40 disabled:cursor-not-allowed z-10"
      >
        <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 20 10 12 18 4" />
        </svg>
      </button>

      <button
        onClick={slider.nextPage}
        disabled={slider.page === slider.totalPages - 1}
        className="absolute top-1/2 right-3 -translate-y-1/2 
          bg-black text-white shadow-xl w-14 h-14 flex items-center justify-center 
          rounded-full border border-white/40
          hover:bg-gray-800 hover:scale-110 transition-all duration-300
          disabled:opacity-40 disabled:cursor-not-allowed z-10"
      >
        <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="10 4 18 12 10 20" />
        </svg>
      </button>
    </div>

    {/* Pagination Dots */}
    <div className="flex justify-center mt-4 gap-2">
      {Array.from({ length: slider.totalPages }).map((_, idx) => (
        <div
          key={idx}
          className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
            idx === slider.page ? "bg-gray-900 scale-125" : "bg-gray-300"
          }`}
          onClick={() => slider.setPage(idx)}
        />
      ))}
    </div>
  </section>
);


    // --- Category Circle Layout ---
    const renderCategories = () => {
        const filteredCategories = categories.filter(
            (c) => c.products && c.products.length > 0 && !["men", "women", "kids"].includes(c.name.toLowerCase())
        );

        let gridCols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
        let circleSize = "w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44";

        if (filteredCategories.length === 3) {
            gridCols = "grid-cols-3";
            circleSize = "w-96 h-96 sm:w-96 sm:h-96 lg:w-96 lg:h-96";
        } else if (filteredCategories.length > 6) {
            gridCols = "grid-cols-4";
            circleSize = "w-64 h-64 sm:w-64 sm:h-64 lg:w-64 lg:h-64";
        }

        return (
            <section>
                <h2 className="text-3xl font-bold mb-12 text-center">Discover</h2>
                <div className={`grid ${gridCols} gap-8 place-items-center`}>
                    {filteredCategories.map((category) => {
                        const latestProduct = category.products[0];
                        let categoryImage = latestProduct?.main_image
                            ? `/storage/${latestProduct.main_image}`
                            : latestProduct?.variants?.find(v => v.image)?.image
                            ? `/storage/${latestProduct.variants.find(v => v.image).image}`
                            : latestProduct?.images?.[0]?.image_path
                            ? `/storage/${latestProduct.images[0].image_path}`
                            : null;

                        return (
                            <a
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="group flex flex-col items-center text-center hover:scale-110 transition-transform duration-300"
                            >
                                <div
                                    className={`${circleSize} rounded-full overflow-hidden shadow-md border-4 border-gray-200
                                        group-hover:border-indigo-500 ring-2 ring-transparent group-hover:ring-indigo-400 transition-all duration-300`}
                                >
                                    {categoryImage ? (
                                        <img src={categoryImage} alt={category.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <h3 className="mt-4 text-lg font-semibold group-hover:text-indigo-600">{category.name}</h3>
                            </a>
                        );
                    })}
                </div>
            </section>
        );
    };

    return (
        <MainLayout  categories={categories}
                menCategories={menCategories}
                womenCategories={womenCategories}
                topCategories={topCategories}>
            <Header settings={settings} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
                {renderCategories()}
                {renderSlider("Top Selling", top, topProducts)}
                {renderSlider("Men", men, menProducts)}
                {renderSlider("Women", women, womenProducts)}
            </div>
        </MainLayout>
    );
}
