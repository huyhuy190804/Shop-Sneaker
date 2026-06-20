// import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white! mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-4">SNEAKER SHOP</h3>
            <p className="text-white! text-sm">
              Discover the latest premium sneaker collection with exclusive
              deals and authentic products.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold mb-4 uppercase text-sm footer-link">
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-white! hover:text-white! transition-colors"
                >
                  All Products
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white! hover:text-white! transition-colors"
                >
                  New Arrivals
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white! hover:text-white! transition-colors"
                >
                  Best Sellers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white! hover:text-white! transition-colors"
                >
                  On Sale
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4 uppercase text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-white! hover:text-white! transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white! hover:text-white! transition-colors"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white! hover:text-white! transition-colors"
                >
                  Returns
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white! hover:text-white! transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4 uppercase text-sm">Newsletter</h4>
            <p className="text-white! text-sm mb-4">
              Subscribe to get special offers and updates
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-gray-800 text-white! text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 text-white! text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6 text-center text-sm text-white!">
          <p>&copy; 2024 Sneaker Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
