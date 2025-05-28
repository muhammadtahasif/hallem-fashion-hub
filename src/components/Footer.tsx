
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold gradient-text font-serif mb-4">
              A&Z Fabrics
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Your premier destination for exquisite women's fashion. From elegant dupattas to ready-made ensembles and premium unstitched fabrics.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>📞 +92 3090449955</p>
              <p>✉️ digitaleyemedia25@gmail.com</p>
              <p>🏪 Pakistan</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-rose-400 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-rose-400 transition-colors">Shop</Link></li>
              <li><Link to="/shop?category=dupattas" className="hover:text-rose-400 transition-colors">Dupattas</Link></li>
              <li><Link to="/shop?category=ready-made" className="hover:text-rose-400 transition-colors">Ready-Made</Link></li>
              <li><Link to="/shop?category=unstitched" className="hover:text-rose-400 transition-colors">Unstitched</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/contact" className="hover:text-rose-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/track-order" className="hover:text-rose-400 transition-colors">Track Order</Link></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Size Guide</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2024 A&Z Fabrics. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-400 hover:text-rose-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-400 hover:text-rose-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
