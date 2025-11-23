import { useState, useMemo, useEffect } from "react";
import { ShoppingCart, Heart, Check, X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import ProductCard from "@/Components/ProductCard";
import axios from "axios";
import Swal from "sweetalert2";
import MainLayout from "@/Layouts/MainLayout";
import { router } from "@inertiajs/react";

export default function Show({ product, relatedProducts, categories, auth , menCategories, womenCategories,topCategories}) {
  const user = auth?.user;

  const allImages = useMemo(() => {
    const imgs = [];
    const seen = new Set();
    // Product main_image
    if (product.main_image) {
      seen.add(product.main_image);
      imgs.push({
            id: `product-${product.id}`,
            url: `/storage/${product.main_image}`,
            variantId:null,
          });
    }

    // Variant images
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

    // Product images
    if (product.images?.length) {
      product.images.forEach((img) => {
        if (img.image_path && !seen.has(img.image_path)) {
          seen.add(img.image_path);
          imgs.push({
            id: `product-${img.id}`,
            url: `/storage/${img.image_path}`,
            variantId: null,
          });
        }
      });
    }

    return imgs;
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(
    allImages[0]?.url || "/images/placeholder.jpg"
  );
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);


  // ✅ Modern login form state
  const [loginValues, setLoginValues] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleLoginChange = (e) => {
    const { name, type, checked, value } = e.target;
    setLoginValues({
      ...loginValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await router.post("/login", loginValues, {
        onSuccess: () => {
          setIsLoading(false);
          // Close modal with smooth animation
          setTimeout(() => setShowLoginModal(false), 300);
        },
        onError: () => {
          setIsLoading(false);
        }
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  // Check wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!selectedVariant || !user) return;

      try {
        const { data } = await axios.get("/wishlist/user");
        if (data.success) {
          setIsInWishlist(data.wishlist.includes(selectedVariant.id));
        }
      } catch (err) {
        console.error(err.response || err);
      }
    };

    checkWishlist();
  }, [selectedVariant, user]);

  // Organize attributes
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
              image: variant.image ? `/storage/${variant.image}` : null,
            });
          }
          if (attrName === "size") {
            sizes.set(value.value, { value: value.value });
          }
        });
      });
    }

    return {
      colorAttributes: Array.from(colors.values()),
      sizeAttributes: Array.from(sizes.values()),
    };
  }, [product.variants]);

  const handleAddToCart = async () => {
  if (!user) {
    setShowLoginModal(true);
    return;
  }
  if (!selectedVariant) return;

  try {
    await axios.post("/cart/add", {
      product_id: product.id,
      product_variant_id: selectedVariant.id,
      quantity: quantity,   // ✅ send selected quantity
    });

    window.dispatchEvent(new Event("cart:updated"));
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Added to Cart!",
      showConfirmButton: false,
      timer: 3000,
    });
  } catch (err) {
    console.error(err.response || err);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Something went wrong!",
      showConfirmButton: false,
      timer: 3000,
    });
  }
};
  const handleBuyNow = async () => {
  if (!user) {
    setShowLoginModal(true);
    return;
  }
  if (!selectedVariant) return;

  try {
    await axios.post("/cart/add", {
      product_id: product.id,
      product_variant_id: selectedVariant.id,
      quantity: quantity,   // same quantity
    });

    window.dispatchEvent(new Event("cart:updated"));

    router.visit("/cart"); // ✅ redirect to cart after adding
  } catch (err) {
    console.error(err.response || err);
  }
};



  const handleToggleWishlist = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!selectedVariant || wishlistLoading) return;
    setWishlistLoading(true);

    try {
      const { data } = await axios.post("/wishlist/toggle", {
        product_id: product.id,
        product_variant_id: selectedVariant.id,
        attributes: selectedAttributes,
      });

      if (data.success) {
        setIsInWishlist(data.action === "added");
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: data.action === "added" ? "success" : "info",
          title: data.message,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (err) {
      console.error(err.response || err);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Something went wrong!",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  const availableSizes = useMemo(() => {
    if (!selectedAttributes.color) return [];
    const sizeSet = new Set();
    product.variants.forEach((variant) => {
      const hasColor = variant.values?.some(
        (v) =>
          v.attribute?.name?.toLowerCase() === "color" &&
          v.value === selectedAttributes.color
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

  const findVariantByAttributes = (attrs) => {
    return product.variants?.find(
      (variant) =>
        variant.values?.some(
          (v) =>
            v.attribute?.name?.toLowerCase() === "color" &&
            v.value === attrs.color
        ) &&
        variant.values?.some(
          (v) =>
            v.attribute?.name?.toLowerCase() === "size" &&
            v.value === attrs.size
        )
    );
  };

  const handleAttributeSelect = (type, value) => {
    const newAttrs = { ...selectedAttributes, [type]: value };
    if (type === "color") {
      if (
        newAttrs.size &&
        !availableSizes.some((s) => s.value === newAttrs.size)
      ) {
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

const increaseQty = () => setQuantity((q) => q + 1);

const decreaseQty = () =>
  setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Get base prices
const variantBasePrice = selectedVariant?.price ?? product.price;
const productBasePrice = product.price;

// 1️⃣ Check for variant discount first
const variantDiscount = selectedVariant?.discounts?.find((d) => d.is_active);
const productDiscount = product?.discounts?.find((d) => d.is_active);

let finalPrice = variantBasePrice;

// Helper function to calculate discounted price
const applyDiscount = (price, discount) => {
  if (!discount) return price;
  if (discount.type === "percentage") {
    return Math.max(price - (price * discount.value) / 100, 0);
  }
  if (discount.type === "fixed") {
    return Math.max(price - discount.value, 0);
  }
  return price;
};

// Apply variant discount first
if (variantDiscount) {
  finalPrice = applyDiscount(variantBasePrice, variantDiscount);
}
// If no variant discount, check product discount
else if (productDiscount) {
  finalPrice = applyDiscount(productBasePrice, productDiscount);
}
// If no discounts at all, use the variant's final price if it exists
else {
  finalPrice = selectedVariant?.final_price ?? variantBasePrice;
}

  const isOutOfStock = selectedVariant
    ? selectedVariant.stock === 0
    : product.stock === 0;

  return (
  <MainLayout 
    categories={categories}
    menCategories={menCategories}
    womenCategories={womenCategories}
    topCategories={topCategories}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16">
      {/* Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
        {/* Left: Images */}
        <div className="space-y-4 sm:space-y-6">
          {/* Main Image */}
          <div className="aspect-square rounded-xl overflow-hidden shadow-md bg-gray-50">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          
          {/* Thumbnail Images */}
          {allImages.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setSelectedImage(img.url);
                    if (img.variantId) {
                      const variant = product.variants.find(
                        (v) => v.id === img.variantId
                      );
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
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === img.url
                      ? "border-gray-900 ring-2 ring-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img 
                    src={img.url} 
                    alt=""
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6 sm:space-y-8">
          {/* Product Title */}
          <div>
  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight break-words overflow-hidden">
    {product.name}
  </h1>
</div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              LE:{finalPrice}
            </span>
            {finalPrice < variantBasePrice && (
              <span className="text-sm sm:text-base text-gray-600 line-through">
                LE:{variantBasePrice}
              </span>
            )}
          </div>

          {/* Description */}
          <div
            className="prose prose-sm sm:prose-base max-w-none text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          {/* Color Selection */}
          {colorAttributes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                Color:{" "}
                <span className="text-gray-600 font-normal">
                  {selectedAttributes.color || "Select"}
                </span>
              </h3>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {colorAttributes.map((color) => {
                  const selected = selectedAttributes.color === color.value;
                  const imageToShow = color.image 
                    ? color.image 
                    : product.main_image 
                    ? `/storage/${product.main_image}`
                    : null;

                  return (
                    <button
                      key={color.value}
                      onClick={() => handleAttributeSelect("color", color.value)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all duration-200 ${
                        selected
                          ? "border-gray-900 ring-2 ring-gray-900 scale-110"
                          : "border-gray-300 hover:border-gray-400 hover:scale-105"
                      }`}
                    >
                      {imageToShow ? (
                        <img
                          src={imageToShow}
                          alt={color.value}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          style={{
                            backgroundColor: color.hexColor || "#ccc",
                          }}
                          className="w-full h-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizeAttributes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                Size:{" "}
                <span className="text-gray-600 font-normal">
                  {selectedAttributes.size || "Select"}
                </span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => {
                  const selected = selectedAttributes.size === size.value;
                  return (
                    <button
                      key={size.value}
                      onClick={() => handleAttributeSelect("size", size.value)}
                      className={`px-3 sm:px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                        selected
                          ? "bg-gray-900 text-white transform scale-105"
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

          {/* Stock Status */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            {selectedVariant ? (
              <p
                className={`font-medium ${
                  selectedVariant.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {selectedVariant.stock > 0
                  ? `✓ In stock`
                  : "✗ Out of stock"}
              </p>
            ) : (
              <p className="text-orange-600 font-medium">
                Please select color and size
              </p>
            )}
          </div>

          {/* Action Buttons Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Wishlist + Quantity Counter */}
            <div className="flex items-center justify-between">
              {/* Wishlist Button */}
              <button
                disabled={!selectedVariant}
                onClick={handleToggleWishlist}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-200 relative group
                  ${
                    isInWishlist
                      ? "border-red-500 text-red-600 bg-red-50 hover:bg-red-100"
                      : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-200"
                  }
                  ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                {wishlistLoading ? (
                  <span className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-400 border-t-transparent rounded-full" />
                ) : isInWishlist ? (
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-red-500 text-red-500" />
                ) : (
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
                
                {/* Tooltip */}
                <span className="hidden sm:block absolute -top-9 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </span>
              </button>

              {/* Quantity Counter */}
              <div className="flex items-center">
                <button
                  onClick={decreaseQty}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-gray-300 text-sm sm:text-xl font-medium transition-all duration-200 hover:bg-gray-200 hover:border-gray-400 active:scale-95"
                >
                  −
                </button>
                <span className="text-sm sm:text-lg font-bold w-10 sm:w-12 text-center bg-gray-100  border-transparent">
                  {quantity}
                </span>
                <button
                  onClick={increaseQty}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-gray-300 text-sm sm:text-xl font-medium transition-all duration-200 hover:bg-gray-200 hover:border-gray-400 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart & Buy Now */}
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
              <button
                disabled={!selectedVariant || isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-gray-100 text-black px-4 sm:px-6 md:px-8 py-3 sm:py-4 font-semibold shadow-md transition-all duration-200 hover:text-white hover:bg-zinc-950 hover:shadow-lg active:scale-98 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">
                  {isOutOfStock
                    ? "Out of Stock"
                    : !selectedVariant
                    ? "Select Options"
                    : "Add to Cart"}
                </span>
              </button>

              <button
                disabled={!selectedVariant || isOutOfStock}
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-zinc-900 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 font-semibold shadow-md transition-all duration-200 hover:bg-zinc-950 hover:shadow-lg active:scale-98 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <span className="whitespace-nowrap">Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts?.length > 0 && (
        <section className="px-2 sm:px-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-gray-900">
            You may also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowLoginModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform duration-200 z-10"
              onClick={() => setShowLoginModal(false)}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Login to continue
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Sign in to continue shopping
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginValues.email}
                    onChange={handleLoginChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginValues.password}
                    onChange={handleLoginChange}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={loginValues.remember}
                      onChange={handleLoginChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Remember me</span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center my-6">
                <div className="flex-1 border-t border-gray-300" />
                <span className="px-3 text-sm text-gray-500 bg-white">or</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <a
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                  >
                    Create account
                  </a>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 rounded-b-2xl px-6 sm:px-8 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-blue-600 hover:underline">Terms</a>{" "}
                and{" "}
                <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  </MainLayout>
);
}