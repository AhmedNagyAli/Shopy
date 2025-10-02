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

  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
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
  }, [menuOpen]);

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

        {/* Center: Site title */}
        <h1 className="text-lg md:text-xl font-bold text-gray-900 text-center">
          {settings?.site_name || "My Shop"}
        </h1>

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
  );
}
