import React, { useEffect, useRef, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { Menu as MenuIcon, User as UserIcon, Search, X } from "lucide-react";

export default function Navbar({ categories = [] }) {
  const { auth, settings } = usePage().props;
  const isAuth = !!auth?.user;
  const user = auth?.user;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const cartRef = useRef(null);
  const cartBtnRef = useRef(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const marqueeRef = useRef(null);

  // Fetch cart items function
  const fetchCartItems = async () => {
    try {
      const response = await fetch("/cart/items");
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };
   // Marquee effect
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let start = 0;
    const speed = 1; // pixels per frame

    const animate = () => {
      start -= speed;
      if (Math.abs(start) >= marquee.scrollWidth / 2) start = 0;
      marquee.style.transform = `translateX(${start}px)`;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!isAuth) return;

    fetchCartItems(); // initial fetch

    // Listen for global event
    const handleCartUpdate = () => fetchCartItems();
    window.addEventListener("cart:updated", handleCartUpdate);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdate);
    };
  }, [isAuth]);

  useEffect(() => {
    function handleOutside(e) {
      if (
        cartOpen &&
        cartRef.current &&
        !cartRef.current.contains(e.target) &&
        cartBtnRef.current &&
        !cartBtnRef.current.contains(e.target)
      ) {
        setCartOpen(false);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") {
        setCartOpen(false);
      }
    }

    if (cartOpen) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [cartOpen]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.get('/search', { q: searchQuery }); 
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div>
      {/* Top Section Offer */}
      {settings?.top_section_offer && (
        <div className="bg-red-900 text-white overflow-hidden h-10 flex items-center relative">
          <div
            ref={marqueeRef}
            className="whitespace-nowrap flex items-center"
            style={{ willChange: "transform" }}
          >
            <span className="px-4">{settings.top_section_offer}</span>
            <span className="px-4">{settings.top_section_offer}</span>
          </div>
        </div>
      )}
      <nav className="w-full bg-white text-gray-800 shadow-lg sticky top-0 z-50 border-b border-gray-200">
      {/* Top Row */}
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Left: User avatar + search */}
        <div className="flex items-center space-x-4">
          {isAuth ? (
            <div className="relative">
              <button
                ref={btnRef}
                onClick={() => setMenuOpen((s) => !s)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                title={user?.name || "Account"}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar ? `/storage/${user.avatar}` : "/images/placeholder.jpg"}
                    alt={user.name}
                    className="w-9 h-9 rounded-full border border-gray-300 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
                    {initials || <UserIcon size={16} />}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div
                  ref={menuRef}
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute left-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg ring-1 ring-gray-200 z-50 focus:outline-none"
                >
                  <a
                    href="/dashboard"
                    role="menuitem"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </a>
                  <a
                    href="/orders"
                    role="menuitem"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </a>
                  <button
                    onClick={() => router.post("/logout")}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
            >
              <UserIcon size={22} />
            </a>
          )}

          {/* Cart */}
          <div className="relative">
            <button
              ref={cartBtnRef}
              onClick={() => {
                setCartOpen((s) => !s);
                if (!cartOpen) fetchCartItems(); // fetch when opening
              }}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600 relative"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h14l-2-9M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {cartOpen && (
  <div
    ref={cartRef}
    role="menu"
    aria-orientation="vertical"
    className="absolute left-0 mt-2 w-64 md:w-80 bg-white text-gray-800 rounded-xl shadow-2xl ring-1 ring-gray-300 z-50 focus:outline-none"
  >
    {cartItems.length === 0 ? (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">Your cart is empty.</p>
        
      </div>
    ) : (
      <>
        {/* Cart Items */}
        <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
          {cartItems.map((item) => {
  const price = item.final_price || 0;
  const total = price * item.quantity;

  return (
    <li key={item.id} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <img
          src={`/storage/${item.variant?.image || item.product?.main_image || "placeholder.jpg"}`}
          alt={item.product?.name}
          className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-200"
        />

        <div className="flex flex-col min-w-0 flex-1 max-w-[calc(100%-4rem)]">
          <span className="text-sm font-semibold truncate">
            {item.product?.name}
          </span>

          {item.variant && (
            <span className="text-xs text-gray-500 truncate mt-0.5">
              {item.variant?.values?.map(v => v.value).join(" / ")}
            </span>
          )}

          <div className="flex items-center justify-between mt-1.5">
            <span className="text-sm text-gray-700 font-medium">
              ${total.toFixed(2)}  {/* 👈 NOW SHOWS DISCOUNTED PRICE */}
            </span>

            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {item.quantity}x
            </span>
          </div>
        </div>
      </div>
    </li>
  );
})}

        </ul>

        {/* Cart Summary */}
        <div className="border-t border-gray-200 mt-3 px-4 py-3 flex justify-between items-center font-semibold text-gray-800">
          <span>Subtotal:</span>
          <span>
            $
            {cartItems
  .reduce(
    (sum, item) => sum + item.final_price * item.quantity,
    0
  )
  .toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          <button
            onClick={() => {
              router.get("/cart");
              setCartOpen(false);
            }}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            View Cart
          </button>
          {/* <button
            onClick={() => {
              router.get("/checkout");
              setCartOpen(false);
            }}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-500 transition-colors font-medium text-sm"
          >
            Checkout
          </button> */}
        </div>
      </>
    )}
  </div>
)}
          </div>

          {/* Search */}
          <div className="relative">
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Search size={22} />
              </button>
            ) : (
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products or categories..."
                  className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                >
                  <X size={18} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Center: Site title as link */}
        <a 
          href="/" 
          className="text-lg md:text-xl font-bold text-gray-900 text-center hover:text-blue-600 transition-colors"
        >
          {settings?.site_name || "My Shop"}
        </a>

        {/* Right: 3-dash menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
        >
          <MenuIcon size={24} />
        </button>
      </div>

      {/* Bottom Row: Categories */}
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center space-x-8 border-t border-gray-100">
        {categories.slice(0, 5).map((cat) => (
          <a
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 bg-white h-full shadow-xl p-6 z-50">
            <button
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-6 text-blue-600">Categories</h2>
            <nav className="flex flex-col space-y-4">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  {cat.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </nav>
    </div>
    
  );
}