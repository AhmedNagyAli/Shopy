import { useState, useMemo } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import ProductCard from "@/Components/ProductCard";

export default function Show({ product, relatedProducts }) {
  // Merge main image + product images + variant images
  const allImages = useMemo(() => {
    const imgs = [];

    if (product.main_image) {
      imgs.push({ id: "main", url: `/storage/${product.main_image}` });
    }

    if (product.images?.length) {
      product.images.forEach((img) =>
        imgs.push({ id: `img-${img.id}`, url: `/storage/${img.path}` })
      );
    }

    if (product.variants?.length) {
      product.variants.forEach((variant) => {
        if (variant.image) {
          imgs.push({ id: `variant-${variant.id}`, url: `/storage/${variant.image}`, variantId: variant.id });
        }
      });
    }

    return imgs;
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(allImages[0]?.url || "/images/placeholder.jpg");
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
      {/* ===== Product Details Section ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image Gallery */}
        <div>
          {/* Main Image */}
          <div className="aspect-square rounded-xl overflow-hidden shadow-md border border-gray-100 bg-gray-50">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex mt-5 gap-3 overflow-x-auto pb-2">
            {allImages.map((img) => (
              <button
                key={img.id}
                onClick={() => {
                  setSelectedImage(img.url);
                  if (img.variantId) {
                    const v = product.variants.find((x) => x.id === img.variantId);
                    setSelectedVariant(v);
                  }
                }}
                className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border transition-all ${
                  selectedImage === img.url ? "border-gray-900 ring-2 ring-gray-900" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img
                  src={img.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div>
          {/* Category */}
          {product.categories?.length > 0 && (
            <p className="text-sm text-gray-500 mb-1">
              {product.categories.map((cat) => cat.name).join(", ")}
            </p>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold text-gray-900">
              ${selectedVariant?.price ?? product.price}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-lg text-gray-400 line-through">
                ${product.original_price}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          {/* Variants (Color/Size etc) */}
          {product.variants?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Choose Variant:</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant);
                      if (variant.image) {
                        setSelectedImage(`/storage/${variant.image}`);
                      }
                    }}
                    className={`px-4 py-2 rounded-full border text-sm transition ${
                      selectedVariant?.id === variant.id
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-300 hover:border-gray-900"
                    }`}
                  >
                    {variant.attributes?.map((attr) => attr.value).join(" / ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition">
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-900 px-6 py-3 rounded-xl font-medium transition">
              <Heart className="w-5 h-5" />
              Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* ===== Related Products Section ===== */}
      {relatedProducts?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
