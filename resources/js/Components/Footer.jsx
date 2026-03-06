export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Shopy</h3>
          <ul className="space-y-2">
            <li><a href="/about" className="hover:text-white transition">About Us</a></li>
            <li><a href="/careers" className="hover:text-white transition">Careers</a></li>
            <li><a href="/press" className="hover:text-white transition">Press</a></li>
            <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2">
            <li><a href="/help" className="hover:text-white transition">Help Center</a></li>
            <li><a href="/shipping" className="hover:text-white transition">Shipping</a></li>
            <li><a href="/returns" className="hover:text-white transition">Returns</a></li>
            <li><a href="/faq" className="hover:text-white transition">FAQ</a></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Account</h3>
          <ul className="space-y-2">
            <li><a href="/login" className="hover:text-white transition">Sign In</a></li>
            <li><a href="/register" className="hover:text-white transition">Register</a></li>
            <li><a href="/orders" className="hover:text-white transition">Order History</a></li>
            <li><a href="/wishlist" className="hover:text-white transition">Wishlist</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Subscribe</h3>
          <p className="text-gray-400 mb-4">Get the latest deals and offers.</p>
          <form className="flex flex-col sm:flex-row gap-2">
            <input 
              type="email" 
              placeholder="Your email" 
              className="px-4 py-2 rounded-lg text-gray-900 focus:outline-none flex-1"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Subscribe
            </button>
          </form>
          <div className="flex items-center gap-4 mt-6">
            <a href="#" className="hover:text-white transition"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="hover:text-white transition"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-white transition"><i className="fab fa-instagram"></i></a>
            <a href="#" className="hover:text-white transition"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-10 py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Shopy. All rights reserved.
      </div>
    </footer>
  );
}
