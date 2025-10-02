import { useState, useMemo, useEffect } from "react";
import { ShoppingCart, Heart, Check } from "lucide-react";
import ProductCard from "@/Components/ProductCard";
import axios from "axios";

export default function Show({ product, relatedProducts }) {
  // Collect unique images from variants
  const allImages = useMemo(() => {
    const imgs = [];
    const seen = new Set();

    if (product.variants?.length) {
      product.variants.forEach((variant) => {
        if (variant.image && !seen.has(variant.image)) {
          seen.add(variant.image);
          imgs.push({
            id: `variant-${variant.id}`,
            url: `/storage/${variant.image}`,
            variantId: variant.id,
          });
        }
      });
    }
    return imgs;
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(allImages[0]?.url || "/images/placeholder.jpg");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Organize attributes into color + size
  const { colorAttributes, sizeAttributes } = useMemo(() => {
    const colors = new Map();
    const sizes = new Map();

    if (product.variants?.length) {
      product.variants.forEach((variant) => {
        variant.values?.forEach((value) => {
          const attrName = value.attribute?.name?.toLowerCase();
          if (attrName === "color" || attrName === "colour") {
            colors.set(value.value, {
              value: value.value,
              hexColor: value.color_code,
            });
          }
          if (attrName === "size") {
            sizes.set(value.value, {
              value: value.value,
            });
          }
        });
      });
    }

    return {
      colorAttributes: Array.from(colors.values()),
      sizeAttributes: Array.from(sizes.values()),
    };
  }, [product.variants]);

  //add the product variant to the user cart
  const handleAddToCart = async () => {
  if (!selectedVariant) return;

  try {
    await axios.post("/cart", {
      product_id: product.id,
      product_variant_id: selectedVariant.id,
      quantity: 1,
    });

    alert("Added to cart!");
  } catch (err) {
    console.error(err.response || err);
    alert("Failed to add to cart");
  }
};


  // Available sizes for a given color
  const availableSizes = useMemo(() => {
    if (!selectedAttributes.color) return [];

    const sizeSet = new Set();
    product.variants.forEach((variant) => {
      const hasColor = variant.values?.some(
        (v) => v.attribute?.name?.toLowerCase() === "color" && v.value === selectedAttributes.color
      );
      if (hasColor) {
        variant.values?.forEach((v) => {
          if (v.attribute?.name?.toLowerCase() === "size") {
            sizeSet.add(v.value);
          }
        });
      }
    });

    return sizeAttributes.filter((s) => sizeSet.has(s.value));
  }, [selectedAttributes.color, product.variants, sizeAttributes]);

  // Find variant by selected color + size
  const findVariantByAttributes = (attrs) => {
    return product.variants?.find(
      (variant) =>
        variant.values?.some(
          (v) => v.attribute?.name?.toLowerCase() === "color" && v.value === attrs.color
        ) &&
        variant.values?.some(
          (v) => v.attribute?.name?.toLowerCase() === "size" && v.value === attrs.size
        )
    );
  };

  // Handle user selecting attribute
  const handleAttributeSelect = (type, value) => {
    const newAttrs = { ...selectedAttributes, [type]: value };

    // Reset size if invalid after color change
    if (type === "color") {
      if (newAttrs.size && !availableSizes.some((s) => s.value === newAttrs.size)) {
        delete newAttrs.size;
      }
    }

    setSelectedAttributes(newAttrs);

    const variant = findVariantByAttributes(newAttrs);
    if (variant) {
      setSelectedVariant(variant);
      if (variant.image) setSelectedImage(`/storage/${variant.image}`);
    } else {
      setSelectedVariant(null);
    }
  };

  // Initialize with first variant
  useEffect(() => {
    if (product.variants?.length > 0 && !selectedVariant) {
      const first = product.variants[0];
      setSelectedVariant(first);

      const attrs = {};
      first.values?.forEach((v) => {
        const n = v.attribute?.name?.toLowerCase();
        if (n === "color" || n === "size") attrs[n] = v.value;
      });
      setSelectedAttributes(attrs);

      if (first.image) setSelectedImage(`/storage/${first.image}`);
    }
  }, [product.variants, selectedVariant]);

  const currentPrice = selectedVariant?.final_price ?? selectedVariant?.price ?? product.price;
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden shadow-md bg-gray-50">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex mt-5 gap-3 overflow-x-auto pb-2">
              {allImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setSelectedImage(img.url);
                    if (img.variantId) {
                      const variant = product.variants.find((v) => v.id === img.variantId);
                      if (variant) {
                        setSelectedVariant(variant);
                        const attrs = {};
                        variant.values?.forEach((v) => {
                          const n = v.attribute?.name?.toLowerCase();
                          if (n === "color" || n === "size") attrs[n] = v.value;
                        });
                        setSelectedAttributes(attrs);
                      }
                    }
                  }}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === img.url ? "border-gray-900 ring-2 ring-gray-900" : "border-gray-200"
                  }`}
                >
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">${currentPrice}</span>
          </div>
          <div className="prose prose-gray max-w-none">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>

          {/* Color Selection */}
          {colorAttributes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">
                Color: <span className="text-gray-600">{selectedAttributes.color || "Select"}</span>
              </h3>
              <div className="flex gap-3">
                {colorAttributes.map((color) => {
                  const selected = selectedAttributes.color === color.value;
                  return (
                    <button
                      key={color.value}
                      onClick={() => handleAttributeSelect("color", color.value)}
                      className={`w-12 h-12 rounded-full border-2 ${
                        selected ? "border-gray-900 ring-2 ring-gray-900" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.hexColor || "#ccc" }}
                    >
                      {selected && <Check className="w-4 h-4 text-white m-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizeAttributes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">
                Size: <span className="text-gray-600">{selectedAttributes.size || "Select"}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => {
                  const selected = selectedAttributes.size === size.value;
                  return (
                    <button
                      key={size.value}
                      onClick={() => handleAttributeSelect("size", size.value)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        selected
                          ? "bg-gray-900 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {size.value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="p-4 bg-gray-50 rounded-lg">
            {selectedVariant ? (
              <p className={selectedVariant.stock > 0 ? "text-green-600" : "text-red-600"}>
                {selectedVariant.stock > 0
                  ? `✓ In stock (${selectedVariant.stock} available)`
                  : "✗ Out of stock"}
              </p>
            ) : (
              <p className="text-orange-600">Please select color and size</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
  disabled={!selectedVariant || isOutOfStock}
  onClick={handleAddToCart}
  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium shadow-lg disabled:bg-gray-400"
>
  <ShoppingCart className="w-5 h-5" />
  {isOutOfStock ? "Out of Stock" : !selectedVariant ? "Select Options" : "Add to Cart"}
</button>

            <button className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-xl">
              <Heart className="w-5 h-5" /> Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedProducts?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
