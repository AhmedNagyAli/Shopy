import MainLayout from '../../Layouts/MainLayout';
import ProductCard from '../../Components/ProductCard';

export default function Show({ category }) {
    console.log(category);
    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold mb-6">{category.name}</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {category.products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
