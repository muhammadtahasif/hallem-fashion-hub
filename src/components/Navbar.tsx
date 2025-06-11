
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu,
  LogOut,
  Package
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import ProductSearchWithSKU from "@/components/ProductSearchWithSKU";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image_url: string;
  slug: string;
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();

  const handleSearchResults = (products: Product[]) => {
    setSearchResults(products);
    setShowSearchResults(products.length > 0);
  };

  const handleProductSelect = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowSearchResults(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut();
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold font-serif text-rose-500 flex-shrink-0">
            A&Z Fabrics
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-rose-500 transition-colors text-sm">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-rose-500 transition-colors text-sm">
              Shop
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-rose-500 transition-colors text-sm">
              Contact
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center max-w-xs lg:max-w-md mx-4 flex-1 relative">
            <ProductSearchWithSKU
              onSearchResults={handleSearchResults}
              placeholder="Search products..."
              className="w-full"
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product.id)}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      <p className="text-sm font-semibold text-rose-500">PKR {product.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Order Tracking - Hidden on mobile */}
            <Link to="/track-order" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="relative p-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative p-2">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50 w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer text-sm">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  {user.email === 'digitaleyemedia25@gmail.com' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer text-sm">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-1 sm:space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-xs sm:text-sm px-2 sm:px-3">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-2">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Mobile Search */}
                  <div className="relative">
                    <ProductSearchWithSKU
                      onSearchResults={handleSearchResults}
                      placeholder="Search products..."
                      className="w-full"
                    />
                    
                    {/* Mobile Search Results */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => handleProductSelect(product.id)}
                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                              <p className="text-sm font-semibold text-rose-500">PKR {product.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation Links */}
                  <div className="space-y-4">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium">
                      Home
                    </Link>
                    <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium">
                      Shop
                    </Link>
                    <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium">
                      Contact
                    </Link>
                    <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium">
                      Track Order
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Overlay to close search results when clicking outside */}
      {showSearchResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSearchResults(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
