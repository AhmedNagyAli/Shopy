import MainLayout from '../../Layouts/MainLayout';
import ProductCard from '../../Components/ProductCard';

export default function Home({ products, categories }) {
    console.log('Products:', products);
    console.log('Categories:', categories);

    return (
        <MainLayout categories={categories}>
            <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">

                {/* Categories Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-gray-900">Shop by Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {categories.map(category => (
                            <a
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="bg-white border rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center group"
                            >
                                <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors" />
                                <h3 className="text-base font-semibold text-gray-900 text-center group-hover:text-blue-600">
                                    {category.name}
                                </h3>
                            </a>
                        ))}
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
