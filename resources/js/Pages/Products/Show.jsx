import { useState, useMemo, useEffect } from "react";
import { ShoppingCart, Heart, Check, X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import ProductCard from "@/Components/ProductCard";
import axios from "axios";
import Swal from "sweetalert2";
import MainLayout from "@/Layouts/MainLayout";
import { router } from "@inertiajs/react";

export default function Show({ product, relatedProducts, categories, auth }) {
  const user = auth?.user;

  const allImages = useMemo(() => {
    const imgs = [];
    const seen = new Set();

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
        quantity: 1,
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

  const variantPrice = selectedVariant?.price ?? product.price;
  const finalPrice = selectedVariant?.final_price ?? variantPrice;
  const isOutOfStock = selectedVariant
    ? selectedVariant.stock === 0
    : product.stock === 0;

  return (
    <MainLayout categories={categories}>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
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
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === img.url
                        ? "border-gray-900 ring-2 ring-gray-900"
                        : "border-gray-200"
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

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-gray-900">
                LE:{finalPrice}
              </span>
              {finalPrice < variantPrice && (
                <span className="text-sm text-gray-600 line-through">
                  LE:{variantPrice}
                </span>
              )}
            </div>

            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* ✅ Color Selection with image fallback */}
            {colorAttributes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">
                  Color:{" "}
                  <span className="text-gray-600">
                    {selectedAttributes.color || "Select"}
                  </span>
                </h3>
                <div className="flex gap-3">
                  {colorAttributes.map((color) => {
                    const selected = selectedAttributes.color === color.value;
                    return (
                      <button
                        key={color.value}
                        onClick={() =>
                          handleAttributeSelect("color", color.value)
                        }
                        className={`w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center ${
                          selected
                            ? "border-gray-900 ring-2 ring-gray-900"
                            : "border-gray-300"
                        }`}
                      >
                        {color.image ? (
                          <img
                            src={color.image}
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
              <div>
                <h3 className="font-semibold mb-2">
                  Size:{" "}
                  <span className="text-gray-600">
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

            <div className="p-4 bg-gray-50 rounded-lg">
              {selectedVariant ? (
                <p
                  className={
                    selectedVariant.stock > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {selectedVariant.stock > 0
                    ? `✓ In stock (${selectedVariant.stock} available)`
                    : "✗ Out of stock"}
                </p>
              ) : (
                <p className="text-orange-600">Please select color and size</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                disabled={!selectedVariant || isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium shadow-lg disabled:bg-gray-400"
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock
                  ? "Out of Stock"
                  : !selectedVariant
                  ? "Select Options"
                  : "Add to Cart"}
              </button>

              <button
                disabled={!selectedVariant || wishlistLoading}
                onClick={handleToggleWishlist}
                className={`flex items-center gap-2 border px-6 py-3 rounded-xl disabled:opacity-50 transition ${
                  isInWishlist
                    ? "bg-red-100 border-red-400 text-red-600"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {!selectedVariant
                  ? "Select Options"
                  : isInWishlist
                  ? "In Wishlist"
                  : ""}
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

        {/* ✅ Modern E-commerce Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur and smooth animation */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setShowLoginModal(false)}
            />
            
            {/* Modal with slide-in animation */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100 opacity-100">
              {/* Close Button */}
              <button
                className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform duration-200 z-10"
                onClick={() => setShowLoginModal(false)}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Header */}
              <div className="p-8 pb-6">
                <div className="text-center mb-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    login to continue
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Sign in to continue shopping
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4 mt-6">
                  {/* Email Field */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginValues.email}
                      onChange={handleLoginChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="remember"
                        checked={loginValues.remember}
                        onChange={handleLoginChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Remember me</span>
                    </label>
                    <a
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none"
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
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-sm text-gray-500 bg-white">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Social Login */}
                {/* <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                    <span className="text-sm font-medium">Twitter</span>
                  </button>
                </div> */}

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
              <div className="bg-gray-50 rounded-b-2xl px-8 py-4 border-t border-gray-200">
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