import React, { useEffect, useRef, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { Menu as MenuIcon, User as UserIcon, Search, X, ShoppingBag, Heart, Phone, ChevronDown } from "lucide-react";

export default function Navbar({ categories = [], menCategories = [], womenCategories = [], topCategories = [] }) {
  const { auth, settings } = usePage().props;
  const isAuth = !!auth?.user;
  const user = auth?.user;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const cartRef = useRef(null);
  const cartBtnRef = useRef(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const marqueeRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // Enhanced marquee effect with proper right-to-left animation
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee || !settings?.top_section_offer) return;

    let animationId;
    let start = 0;
    
    const getSpeed = () => {
      if (window.innerWidth < 768) return 0.5;
      if (window.innerWidth < 1024) return 0.8;
      return 1;
    };

    const animate = () => {
      start -= getSpeed();
      
      const contentWidth = marquee.scrollWidth / 2;
      if (Math.abs(start) >= contentWidth) {
        start = 0;
      }
      
      marquee.style.transform = `translateX(${start}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      start = 0;
      if (marquee) {
        marquee.style.transform = `translateX(0px)`;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [settings?.top_section_offer]);

  useEffect(() => {
    if (!isAuth) return;

    fetchCartItems();

    const handleCartUpdate = () => fetchCartItems();
    window.addEventListener("cart:updated", handleCartUpdate);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdate);
    };
  }, [isAuth]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

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
      
      // Close dropdown when clicking outside
      if (
        activeDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setActiveDropdown(null);
      }

      // Close search when clicking outside on mobile
      if (
        searchOpen &&
        window.innerWidth < 768 &&
        !e.target.closest('.search-container')
      ) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") {
        setCartOpen(false);
        setActiveDropdown(null);
        if (searchOpen) {
          setSearchOpen(false);
          setSearchQuery("");
        }
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [cartOpen, activeDropdown, searchOpen]);

  const handleDropdownEnter = (dropdownName) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(dropdownName);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleDropdownEnterContent = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
  };

  const handleDropdownLeaveContent = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.get('/search', { q: searchQuery }); 
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Filter out men and women from main categories for desktop nav
  const mainCategories = topCategories.filter(cat => 
    !['men', 'women'].includes(cat.slug.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="sticky top-0 z-50">
      {/* Enhanced Top Announcement Bar */}
      {settings?.top_section_offer && (
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white overflow-hidden relative group">
          <div className="h-9 md:h-10 flex items-center relative">
            {/* Marquee Container */}
            <div className="absolute inset-0 flex items-center">
              <div
                ref={marqueeRef}
                className="flex items-center whitespace-nowrap"
                style={{ 
                  willChange: "transform",
                }}
              >
                {/* Duplicate content for seamless loop */}
                {[...Array(6)].map((_, index) => (
                  <React.Fragment key={index}>
                    <span className="px-6 md:px-8 text-sm md:text-base font-medium flex items-center gap-2">
                      {settings.top_section_offer}
                    </span>
                    <span className="text-blue-300 opacity-40">•</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Gradient overlays for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-900 to-transparent z-10" />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="w-full bg-white text-gray-800 shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Top Row */}
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Left: Mobile menu + Logo */}
            <div className="flex items-center space-x-3 md:space-x-6 lg:space-x-8">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 md:hidden"
              >
                <MenuIcon size={20} />
              </button>

              {/* Logo */}
              <a 
                href="/" 
                className="flex items-center space-x-2 group"
              >
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {settings?.site_name || ""}
                </span>
              </a>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8" ref={dropdownRef}>
              {/* Men Categories Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleDropdownEnter('men')}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="flex items-center space-x-1 text-sm font-semibold hover:text-blue-600 transition-colors py-2">
                  <span>Men</span>
                  <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'men' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeDropdown === 'men' && menCategories.length > 0 && (
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 py-3"
                    onMouseEnter={handleDropdownEnterContent}
                    onMouseLeave={handleDropdownLeaveContent}
                  >
                    <div className="py-2 max-h-60 overflow-y-auto">
                      {menCategories.map((category) => (
                        <a
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          className="block px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {category.name}
                        </a>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <a
                        href="/categories/men"
                        className="block px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors text-center"
                        onClick={() => setActiveDropdown(null)}
                      >
                        View All Men's
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Women Categories Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleDropdownEnter('women')}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="flex items-center space-x-1 text-sm font-semibold hover:text-blue-600 transition-colors py-2">
                  <span>Women</span>
                  <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'women' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeDropdown === 'women' && womenCategories.length > 0 && (
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 py-3"
                    onMouseEnter={handleDropdownEnterContent}
                    onMouseLeave={handleDropdownLeaveContent}
                  >
                    <div className="py-2 max-h-60 overflow-y-auto">
                      {womenCategories.map((category) => (
                        <a
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          className="block px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {category.name}
                        </a>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <a
                        href="/categories/women"
                        className="block px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors text-center"
                        onClick={() => setActiveDropdown(null)}
                      >
                        View All Women's
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Categories */}
              {mainCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="text-sm font-semibold hover:text-blue-600 transition-colors relative group py-2 whitespace-nowrap"
                >
                  {cat.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </a>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              {/* Search - Enhanced Responsive Design */}
              <div className="relative search-container">
                {!searchOpen ? (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    <Search size={20} />
                  </button>
                ) : (
                  <>
                    {/* Mobile Full-screen Search Overlay */}
                    <div className="md:hidden fixed inset-0 bg-white z-50 flex items-start pt-20 px-4">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold">Search</h2>
                          <button
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products, brands..."
                            className="flex-1 border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Search size={18} />
                          </button>
                        </form>
                        {/* Recent searches or popular suggestions can go here */}
                        <div className="text-sm text-gray-500">
                          <p>Try searching for "shoes", "jackets", or "accessories"</p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Search Dropdown */}
                    <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 min-w-[300px]">
                      <form onSubmit={handleSearch} className="flex items-center space-x-2">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products, brands..."
                          className="flex-1 border-0 px-3 py-2 focus:outline-none focus:ring-0 text-sm min-w-0"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                        >
                          <Search size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>

              {/* User Account - Improved Responsive */}
              {isAuth ? (
                <div className="relative">
                  <button
                    ref={btnRef}
                    onClick={() => setMenuOpen((s) => !s)}
                    className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar ? `/storage/${user.avatar}` : "/images/placeholder.jpg"}
                        alt={user.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs sm:text-sm font-medium text-white">
                        {initials || <UserIcon size={14} />}
                      </div>
                    )}
                    <span className="hidden lg:block text-sm font-medium max-w-20 truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {menuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-2"
                    >
                      <div className="px-3 sm:px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <a
                        href="/dashboard"
                        className="block px-3 sm:px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Dashboard
                      </a>
                      <a
                        href="/orders"
                        className="block px-3 sm:px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Orders
                      </a>
                      <a
                        href="/wishlist"
                        className="block px-3 sm:px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Wishlist
                      </a>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => router.post("/logout")}
                          className="w-full text-left px-3 sm:px-4 py-2 text-sm hover:bg-gray-50 text-red-600 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <a
                    href="/login"
                    className="hidden sm:block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Sign Up
                  </a>
                </div>
              )}

              {/* Cart - Improved Responsive */}
              <div className="relative">
                <button
                  ref={cartBtnRef}
                  onClick={() => {
                    setCartOpen((s) => !s);
                    if (!cartOpen) fetchCartItems();
                  }}
                  className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 relative"
                >
                  <ShoppingBag size={20} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center font-medium min-w-[1rem]">
                      {cartItems.length > 99 ? '99+' : cartItems.length}
                    </span>
                  )}
                </button>

                {cartOpen && (
                  <div
                    ref={cartRef}
                    className="absolute right-0 mt-2 w-screen max-w-xs sm:max-w-sm md:max-w-md bg-white shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden"
                  >
                    <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
                      <button
                        onClick={() => setCartOpen(false)}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    {cartItems.length === 0 ? (
                      <div className="p-6 sm:p-8 text-center">
                        <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 mb-3 text-sm sm:text-base">Your cart is empty</p>
                        <a 
                          href="/" 
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-block"
                          onClick={() => setCartOpen(false)}
                        >
                          Start Shopping
                        </a>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                          {cartItems.map((item) => {
                            const price = item.final_price || 0;
                            const total = price * item.quantity;

                            return (
                              <div key={item.id} className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <div className="flex space-x-3">
                                  <img
                                    src={`/storage/${item.variant?.image || item.product?.main_image || "placeholder.jpg"}`}
                                    alt={item.product?.name}
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                      {item.product?.name}
                                    </h4>
                                    {item.variant && (
                                      <p className="text-xs text-gray-500 mt-1 truncate">
                                        {item.variant?.values?.map(v => v.value).join(" / ")}
                                      </p>
                                    )}
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-sm font-semibold text-gray-900">
                                        ${total.toFixed(2)}
                                      </span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        Qty: {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="p-3 sm:p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-base sm:text-lg font-semibold text-gray-900">Subtotal:</span>
                            <span className="text-base sm:text-lg font-semibold text-gray-900">
                              $
                              {cartItems
                                .reduce(
                                  (sum, item) => sum + item.final_price * item.quantity,
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => {
                                router.get("/cart");
                                setCartOpen(false);
                              }}
                              className="flex-1 bg-gray-900 text-white py-2 sm:py-3 hover:bg-zinc-800 transition-colors font-medium text-sm"
                            >
                              View Cart
                            </button>
                            <button
                              onClick={() => {
                                router.get("/cart");
                                setCartOpen(false);
                              }}
                              className="flex-1 bg-gray-950 text-white py-2 sm:py-3 hover:bg-zinc-800 transition-colors font-medium text-sm"
                            >
                              Checkout
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Categories */}
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-2 hide-scrollbar">
              <a
                href="/categories/men"
                className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap flex-shrink-0 px-1"
              >
                Men
              </a>
              <a
                href="/categories/women"
                className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap flex-shrink-0 px-1"
              >
                Women
              </a>
              {mainCategories.slice(0, 3).map((cat) => (
                <a
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap flex-shrink-0 px-1"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[90vw] bg-white h-full shadow-xl ml-auto transform transition-transform overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* User info if logged in */}
              {isAuth && (
                <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
                  {user?.avatar ? (
                    <img
                      src={`/storage/${user.avatar}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-medium text-white">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>

            <nav className="p-4 sm:p-6">
              {/* Men Categories in Mobile Sidebar */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 px-3">Men</h3>
                <div className="space-y-1">
                  {menCategories.slice(0, 4).map((category) => (
                    <a
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      {category.name}
                    </a>
                  ))}
                  <a
                    href="/categories/men"
                    className="block py-2 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    View All Men's
                  </a>
                </div>
              </div>

              {/* Women Categories in Mobile Sidebar */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 px-3">Women</h3>
                <div className="space-y-1">
                  {womenCategories.slice(0, 4).map((category) => (
                    <a
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      {category.name}
                    </a>
                  ))}
                  <a
                    href="/categories/women"
                    className="block py-2 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    View All Women's
                  </a>
                </div>
              </div>

              {/* Other Categories */}
              <div className="space-y-1 mb-6">
                {mainCategories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-6 space-y-1">
                <a href="/dashboard" className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
                  Dashboard
                </a>
                <a href="/orders" className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
                  My Orders
                </a>
                <a href="/wishlist" className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
                  Wishlist
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}