import { useState } from "react";
import { usePage } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import ProductCard from "../../Components/ProductCard";
import Header from "../../Components/Header";

export default function Home({ topProducts, menProducts, womenProducts, categories, menCategories, womenCategories, topCategories }) {
    
    const { settings } = usePage().props;

    const createSlider = (products, itemsPerPage = 8) => {
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

    // Top products slider with single row
    const createTopProductsSlider = (products) => {
        const itemsPerPage = 4; // Show 4 products per page in a single row
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

    const top = createTopProductsSlider(topProducts);
    const men = createSlider(menProducts, 8);
    const women = createSlider(womenProducts, 8);

    // Single row slider for top products
    const renderTopProductsSlider = (title, slider, products) => (
        <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                
                {/* Pagination Dots */}
                <div className="flex items-center gap-2">
                    {Array.from({ length: slider.totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => slider.setPage(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                idx === slider.page 
                                    ? "bg-gray-900 scale-125" 
                                    : "bg-gray-300 hover:bg-gray-400"
                            }`}
                            aria-label={`Go to page ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className="relative">
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                        transform: `translateX(-${slider.page * 100}%)`,
                        width: `${slider.totalPages * 100}%`,
                    }}
                >
                    {Array.from({ length: slider.totalPages }).map((_, pageIndex) => (
                        <div
                            key={pageIndex}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4 w-full flex-shrink-0"
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
                {slider.totalPages > 1 && (
                    <>
                        <button
                            onClick={slider.prevPage}
                            disabled={slider.page === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 
                                bg-white/90 backdrop-blur-sm text-gray-900 
                                w-12 h-12 flex items-center justify-center 
                                rounded-full border border-gray-200 shadow-lg
                                hover:bg-white hover:shadow-xl hover:scale-105 
                                transition-all duration-300
                                disabled:opacity-0 disabled:pointer-events-none z-10"
                            aria-label="Previous products"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>

                        <button
                            onClick={slider.nextPage}
                            disabled={slider.page === slider.totalPages - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 
                                bg-white/90 backdrop-blur-sm text-gray-900 
                                w-12 h-12 flex items-center justify-center 
                                rounded-full border border-gray-200 shadow-lg
                                hover:bg-white hover:shadow-xl hover:scale-105 
                                transition-all duration-300
                                disabled:opacity-0 disabled:pointer-events-none z-10"
                            aria-label="Next products"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </section>
    );

    // Original multi-row slider for other sections
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

    // Modern Fancy Category Circles with Hover Effects
    const renderCategories = () => {
        const filteredCategories = categories.filter(
            (c) => c.products && c.products.length > 0 && !["men", "women", "kids"].includes(c.name.toLowerCase())
        );

        return (
            <section className="py-16">
                <div className="text-center mb-16">
                    <p className="text-gray-900 text-3xl font-bold max-w-2xl mx-auto mb-4">
                        Discover Our Collections
                    </p>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        Curated for every style and occasion
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 lg:gap-14">
                    {filteredCategories.map((category) => {
                        const productWithImage = category.products?.find(product => {
                            const hasMainImage = product.main_image;
                            const hasVariantImage = product.variants?.some(v => v.image);
                            const hasProductImages = product.images?.length > 0;
                            return hasMainImage || hasVariantImage || hasProductImages;
                        });

                        let categoryImage = null;

                        if (productWithImage) {
                            const variantWithImage = productWithImage.variants?.find(v => v.image);
                            if (variantWithImage?.image) {
                                categoryImage = `/storage/${variantWithImage.image}`;
                            } 
                            else if (productWithImage.main_image) {
                                categoryImage = `/storage/${productWithImage.main_image}`;
                            }
                            else if (productWithImage.images?.[0]?.image_path) {
                                categoryImage = `/storage/${productWithImage.images[0].image_path}`;
                            }
                        }

                        return (
                            <a
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="group flex flex-col items-center text-center relative"
                            >
                                {/* Outer Glow Effect */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl group-hover:blur-2xl group-hover:scale-110 transition-all duration-500 opacity-0 group-hover:opacity-100 -z-10" />
                                
                                {/* Main Circle Container */}
                                <div className="relative">
                                    {/* Animated Border Ring */}
                                    <div className="
                                        absolute inset-0 rounded-full 
                                        bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                                        group-hover:animate-spin
                                        transition-all duration-1000
                                        opacity-0 group-hover:opacity-100
                                        scale-110
                                    " />
                                    
                                    {/* Inner Circle with Image */}
                                    <div className="
                                        relative
                                        w-32 h-32 sm:w-36 sm:h-36 lg:w-44 lg:h-44 xl:w-48 xl:h-48
                                        rounded-full overflow-hidden 
                                        bg-gradient-to-br from-white to-gray-50
                                        border-4 border-white
                                        shadow-2xl shadow-gray-300/50
                                        group-hover:shadow-2xl group-hover:shadow-indigo-300/50
                                        group-hover:scale-110
                                        transition-all duration-500 ease-out
                                        z-10
                                    ">
                                        {categoryImage ? (
                                            <img 
                                                src={categoryImage} 
                                                alt={category.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                <div className="text-gray-400 text-2xl font-bold">
                                                    {category.name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                </div>
                                
                                {/* Category Text */}
                                <div className="mt-8 space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 group-hover:scale-105 transform">
                                        {category.name}
                                    </h3>
                                    
                                    <div className="
                                        w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 
                                        rounded-full mx-auto
                                        group-hover:w-12
                                        transition-all duration-500
                                    " />

                                </div>
                            </a>
                        );
                    })}
                </div>

                {/* Background Decorative Elements */}
                <div className="absolute left-0 right-0 -z-10 opacity-10">
                    <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-1/2 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>
            </section>
        );
    };

    return (
        <MainLayout  
            categories={categories}
            menCategories={menCategories}
            womenCategories={womenCategories}
            topCategories={topCategories}
        >
            <Header settings={settings} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
                {renderCategories()}
                {/* {renderTopProductsSlider("Top Selling", top, topProducts)} */}
                {renderSlider("Men", men, menProducts)}
                {renderSlider("Women", women, womenProducts)}
            </div>
        </MainLayout>
    );
}