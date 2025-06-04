
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <div className="text-xl sm:text-2xl font-bold gradient-text font-serif mb-4">
              A&Z Fabrics
            </div>
            <p className="text-gray-300 mb-4 max-w-md text-sm sm:text-base">
              Your premier destination for exquisite women's fashion. From elegant dupattas to ready-made ensembles and premium unstitched fabrics.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>📞 +923234882256</p>
              <p>✉️ digitaleyemedia25@gmail.com</p>
              <p>🏪 Pakistan</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-rose-400 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-rose-400 transition-colors">Shop</Link></li>
              <li><Link to="/contact" className="hover:text-rose-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Customer Service</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/contact" className="hover:text-rose-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/track-order" className="hover:text-rose-400 transition-colors">Track Order</Link></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Returns</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-gray-400">
            © 2024 A&Z Fabrics. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-rose-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-rose-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
