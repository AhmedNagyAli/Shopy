import MainLayout from '../../Layouts/MainLayout';
import ProductCard from '../../Components/ProductCard';

export default function Home({ products, categories }) {
    return (
        <MainLayout categories={categories}>
            <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">

                {/* Categories Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-gray-900">Shop by Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {categories.map(category => {
                            const latestProduct = category.products?.[0] || null;

                            return (
                                <a
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="bg-white border rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 flex flex-col items-center group"
                                >
                                    <div className="">
                                        {latestProduct?.main_image ? (
                                            <img
                                                src={`/storage/${latestProduct.main_image}`}
                                                alt={latestProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-sm">No Image</span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 text-center group-hover:text-blue-600">
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
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
