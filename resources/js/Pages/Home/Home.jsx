import { usePage } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import ProductCard from "../../Components/ProductCard";
import Header from "../../Components/Header";

export default function Home({ products, categories }) {
    const { settings } = usePage().props;

    return (
        <MainLayout categories={categories}>
            {/* ✅ Header only appears here (Home page) */}
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
                                    {/* Circle Image */}
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

                                    {/* Category Name */}
                                    <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                        {category.name}
                                    </h3>
                                </a>
                            );
                        })}
                    </div>
                </section>

                {/* Products Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-gray-900">Featured Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
