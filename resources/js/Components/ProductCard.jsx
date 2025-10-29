import { Link } from '@inertiajs/react';
import { ShoppingCart, Heart } from 'lucide-react';

export default function ProductCard({ product }) {
    // ✅ Default variant
    const defaultVariant =
        product.variants?.find(v => Number(v.is_default) === 1) ||
        product.variants?.[0] ||
        null;

    // ✅ Prices
    const variantPrice = defaultVariant?.price ?? product.price;
    const finalPrice = defaultVariant?.final_price ?? variantPrice;
    if(product.discounts){
        console.log(product.discounts)

    }

    // ✅ Image
    const imageUrl =
        defaultVariant?.image
            ? `/storage/${defaultVariant.image}`
            : product.main_image
                ? `/storage/${product.main_image}`
                : '/images/placeholder.jpg';

    // ✅ Unique variants by color (deduplicated)
    const colorVariants = [
        ...new Map(
            product.variants
                ?.map(v => {
                    const color = v.values?.find(val => val.attribute?.slug === 'color');
                    return color ? [color.value, v] : null;
                })
                .filter(Boolean)
        ).values(),
    ];

    // ✅ Unique sizes
    const sizes = [
        ...new Map(
            product.variants
                ?.flatMap(v =>
                    v.values?.filter(val => val.attribute?.slug === 'size')
                )
                .map(val => [val.id, val])
        ).values(),
    ];

    return (
        <Link
            href={route('products.show', product.slug)}
            className="block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group hover:border-gray-200"
        >
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Quick Actions */}
                <div
                    onClick={e => e.preventDefault()}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2"
                >
                    <button className="bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition-colors">
                        <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {/* Add to Cart */}
                <button
                    onClick={e => e.preventDefault()}
                    className="absolute bottom-3 right-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 active:scale-95"
                >
                    <ShoppingCart className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Category */}
                {product.category && (
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        {product.category}
                    </p>
                )}

                {/* Name */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">
                        ${finalPrice}
                    </span>
                    {finalPrice < variantPrice && (
                        <span className="text-sm text-gray-500 line-through">
                            ${variantPrice}
                        </span>
                    )}
                </div>

                {/* 🎨 Color Variants & Sizes */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {/* Color Circles */}
          <div className="flex flex-col gap-2">
            {colorVariants.length > 0 && (
              <div className="flex items-center gap-2">
                {colorVariants.map((variant) => {
                  const colorVal = variant.values?.find(
                    (v) =>
                      v.attribute?.slug === "color" ||
                      v.attribute?.name?.toLowerCase() === "color"
                  );
                  const colorCode = colorVal?.color_code || "#ccc";

                  const imgToShow = variant.image
                    ? `/storage/${variant.image}`
                    : product.main_image
                    ? `/storage/${product.main_image}`
                    : product.images?.[0]
                    ? `/storage/${product.images[0].image_path}`
                    : null;

                  return imgToShow ? (
                    <img
                      key={variant.id}
                      src={imgToShow}
                      alt={colorVal?.value}
                      className="w-9 h-9 rounded-full border border-gray-200 object-cover shadow-sm cursor-pointer hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      key={variant.id}
                      className="w-9 h-9 rounded-full border border-gray-300 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: colorCode }}
                    />
                  );
                })}
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="flex items-center gap-1">
                {sizes.map((size) => (
                  <span
                    key={size.id}
                    className="px-2 py-0.5 text-xs rounded border border-gray-300 bg-gray-50 text-gray-700"
                  >
                    {size.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

                {/* Badges */}
                {/* <div className="flex flex-wrap gap-1 mt-3">
                    {defaultVariant?.stock === 0 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            Out of Stock
                        </span>
                    )}
                    {defaultVariant?.stock > 0 && defaultVariant?.stock <= 10 && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            Low Stock
                        </span>
                    )}
                    {product.is_new && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            New
                        </span>
                    )}
                    {product.is_best_seller && (
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            Best Seller
                        </span>
                    )}
                </div> */}
            </div>
        </Link>
    );
}
