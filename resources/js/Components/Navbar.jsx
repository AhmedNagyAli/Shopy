import { useState } from "react";
import { Menu, User, X } from "lucide-react"; // modern icons

export default function Navbar({ categories, isAuth = false, user = null }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <nav className="w-full bg-gray-900 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Left: User menu */}
                <div className="flex items-center space-x-4">
                    {!isAuth ? (
                        <a
                            href="/login"
                            className="flex items-center space-x-2 hover:text-cyan-400 transition-colors"
                        >
                            <User size={22} />
                            <span className="text-sm font-medium">Login / Register</span>
                        </a>
                    ) : (
                        <div className="relative group">
                            <button className="flex items-center space-x-2 hover:text-cyan-400 transition-colors">
                                <User size={22} />
                                <span className="text-sm font-medium">{user?.name}</span>
                            </button>
                            {/* Dropdown */}
                            <div className="absolute left-0 mt-2 w-40 bg-gray-800 text-white rounded-lg shadow-lg hidden group-hover:block">
                                <a
                                    href="/dashboard"
                                    className="block px-4 py-2 text-sm hover:bg-gray-700"
                                >
                                    Dashboard
                                </a>
                                <a
                                    href="/orders"
                                    className="block px-4 py-2 text-sm hover:bg-gray-700"
                                >
                                    My Orders
                                </a>
                                <a
                                    href="/logout"
                                    className="block px-4 py-2 text-sm hover:bg-gray-700 text-red-400"
                                >
                                    Logout
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center: Categories */}
                <div className="hidden md:flex space-x-8">
                    {categories.slice(0, 5).map((cat) => (
                        <a
                            key={cat.id}
                            href={`/categories/${cat.slug}`}
                            className="text-sm font-medium hover:text-cyan-400 transition-colors"
                        >
                            {cat.name}
                        </a>
                    ))}
                </div>

                {/* Right: Sidebar toggle */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    {/* Sidebar Content */}
                    <div className="relative w-72 bg-gray-900 h-full shadow-xl p-6 z-50">
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-800 transition-colors"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={22} />
                        </button>

                        <h2 className="text-xl font-bold mb-6 text-cyan-400">Categories</h2>
                        <nav className="flex flex-col space-y-4">
                            {categories.map((cat) => (
                                <a
                                    key={cat.id}
                                    href={`/categories/${cat.slug}`}
                                    className="text-sm font-medium hover:text-cyan-400 transition-colors"
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
