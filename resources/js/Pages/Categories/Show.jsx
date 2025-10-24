import MainLayout from '../../Layouts/MainLayout';
import ProductCard from '../../Components/ProductCard';

export default function Show({ category,categories }) {
    
    return (
        <MainLayout categories={categories}>
            <div className="max-w-7xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold mb-6">{category.name}</h1>

                {category.products && category.products.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {category.products.map(product => (
            <ProductCard key={product.id} product={product} />
        ))}
    </div>
) : (
    <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl">✖</span>
            No {category?.name ?? "Products" }
        </div>
    </div>
)}

            </div>
        </MainLayout>
    );
}
