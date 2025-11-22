import { useState } from "react";
import { usePage } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import ProductCard from "../../Components/ProductCard";
import Header from "../../Components/Header";

export default function Home({ topProducts, menProducts, womenProducts, categories }) {
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

    const top = createSlider(topProducts);
    const men = createSlider(menProducts);
    const women = createSlider(womenProducts);

    const renderSlider = (title, slider, products) => (
        <section className="mt-10">
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
                            className="grid 
                                grid-cols-2 sm:grid-cols-3 
                                lg:grid-cols-4 
                                gap-6 py-4
                                w-full flex-shrink-0"
                        >
                            {products
                                .slice(
                                    pageIndex * slider.itemsPerPage,
                                    (pageIndex + 1) * slider.itemsPerPage
                                )
                                .map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                        </div>
                    ))}
                </div>

                {/* LEFT ARROW */}
                <button
                    onClick={slider.prevPage}
                    disabled={slider.page === 0}
                    className="absolute top-1/2 left-3 -translate-y-1/2 
                        bg-black text-white shadow-xl
                        w-14 h-14 flex items-center justify-center 
                        rounded-full border border-white/40
                        hover:bg-gray-800 hover:scale-110 transition-all duration-300
                        disabled:opacity-40 disabled:cursor-not-allowed z-10"
                >
                    <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 20 10 12 18 4" />
                    </svg>
                </button>

                {/* RIGHT ARROW */}
                <button
                    onClick={slider.nextPage}
                    disabled={slider.page === slider.totalPages - 1}
                    className="absolute top-1/2 right-3 -translate-y-1/2 
                        bg-black text-white shadow-xl
                        w-14 h-14 flex items-center justify-center 
                        rounded-full border border-white/40
                        hover:bg-gray-800 hover:scale-110 transition-all duration-300
                        disabled:opacity-40 disabled:cursor-not-allowed z-10"
                >
                    <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="10 4 18 12 10 20" />
                    </svg>
                </button>
            </div>

            {/* DOTS */}
            <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: slider.totalPages }).map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all ${
                            idx === slider.page
                                ? "bg-gray-900 scale-125"
                                : "bg-gray-300"
                        }`}
                        onClick={() => slider.setPage(idx)}
                    />
                ))}
            </div>
        </section>
    );

    return (
        <MainLayout categories={categories}>
            <Header settings={settings} />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">

                {/* Discover Categories */}
                <section>
                    <h2 className="text-3xl font-bold mb-12 text-center">Discover</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 place-items-center">
                        {categories.map((category) => {
                            const latestProduct = category.products?.[0] ?? null;
                            return (
                                <a
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="group flex flex-col items-center text-center hover:scale-110 duration-300"
                                >
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-md group-hover:shadow-xl border-4 border-gray-200 group-hover:border-blue-500 duration-300">
                                        {latestProduct?.main_image ? (
                                            <img
                                                src={`/storage/${latestProduct.main_image}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="mt-4 text-lg font-semibold group-hover:text-blue-600">
                                        {category.name}
                                    </h3>
                                </a>
                            );
                        })}
                    </div>
                </section>

                {renderSlider("Top Selling ", top, topProducts)}
                {renderSlider(" Men ", men, menProducts)}
                {renderSlider(" Women ", women, womenProducts)}
            </div>
        </MainLayout>
    );
}
