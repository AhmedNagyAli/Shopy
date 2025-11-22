import { useState } from "react";
import { usePage } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import ProductCard from "../../Components/ProductCard";
import Header from "../../Components/Header";

export default function Home({ products, categories }) {
    const { settings } = usePage().props;

    // --- Pagination for Sliding Products ---
    const itemsPerPage = 8; // Products per slide
    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const nextPage = () => page < totalPages - 1 && setPage(page + 1);
    const prevPage = () => page > 0 && setPage(page - 1);

    return (
        <MainLayout categories={categories}>
            <Header settings={settings} />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
                {/* Categories Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-12 text-gray-900 text-center">
                        Discover
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 place-items-center">
                        {categories.map((category) => {
                            const latestProduct = category.products?.[0] || null;

                            return (
                                <a
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="group flex flex-col items-center text-center transition-transform duration-300 hover:scale-110"
                                >
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden border-4 border-gray-200 shadow-md group-hover:shadow-xl group-hover:border-blue-500 transition-all duration-300">
                                        {latestProduct?.main_image ? (
                                            <img
                                                src={`/storage/${latestProduct.main_image}`}
                                                alt={latestProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                        {category.name}
                                    </h3>
                                </a>
                            );
                        })}
                    </div>
                </section>

                {/* 🔥 Featured Products with Sliding Pagination */}
<section>
    <h2 className="text-3xl font-bold mb-8 text-gray-900">
        Featured Products
    </h2>

    <div className="relative overflow-hidden">

        {/* Sliding Wrapper */}
        <div
            className="flex transition-transform duration-500"
            style={{
                transform: `translateX(-${page * 100}%)`,
                width: `${totalPages * 100}%`,
            }}
        >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div
                    key={pageIndex}
                    className="grid 
                        grid-cols-1 sm:grid-cols-2 
                        lg:grid-cols-3 xl:grid-cols-4 
                        gap-8 w-full flex-shrink-0"
                >
                    {products
                        .slice(
                            pageIndex * itemsPerPage,
                            (pageIndex + 1) * itemsPerPage
                        )
                        .map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                </div>
            ))}
        </div>
<button
    onClick={prevPage}
    disabled={page === 0}
    className="absolute top-1/2 left-4 -translate-y-1/2 
        bg-black text-white shadow-xl
        w-14 h-14 flex items-center justify-center 
        rounded-full
        hover:bg-gray-800 hover:scale-110 
        transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed"
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="18 20 10 12 18 4" />
    </svg>
</button>

<button
    onClick={nextPage}
    disabled={page === totalPages - 1}
    className="absolute top-1/2 right-4 -translate-y-1/2 
        bg-black text-white shadow-xl
        w-14 h-14 flex items-center justify-center 
        rounded-full
        hover:bg-gray-800 hover:scale-110 
        transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed"
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="10 4 18 12 10 20" />
    </svg>
</button>

    </div>

    {/* Pagination Dots */}
    <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }).map((_, idx) => (
            <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                    idx === page ? "bg-gray-900 scale-125" : "bg-gray-300"
                }`}
            />
        ))}
    </div>
</section>

            </div>
        </MainLayout>
    );
}
