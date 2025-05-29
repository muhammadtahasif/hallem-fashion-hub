import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { 
  Menu, 
  X, 
  User, 
  ShoppingCart, 
  LogOut, 
  Package,
  ChevronDown 
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
    
    // Set up real-time subscription for categories
    const categoriesChannel = supabase
      .channel('categories-navbar-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          console.log('Categories changed in navbar:', payload);
          fetchCategories();
        }
      )
      .subscribe();

    // Set up real-time subscription for subcategories
    const subcategoriesChannel = supabase
      .channel('subcategories-navbar-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subcategories' },
        (payload) => {
          console.log('Subcategories changed in navbar:', payload);
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(subcategoriesChannel);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');

      if (subcategoriesError) throw subcategoriesError;

      // Group subcategories by category
      const categoriesWithSubs = (categoriesData || []).map(category => ({
        ...category,
        subcategories: (subcategoriesData || []).filter(sub => sub.category_id === category.id)
      }));

      setCategories(categoriesWithSubs);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleCategoryClick = (categorySlug: string) => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.set('category', categorySlug);
    currentParams.delete('subcategory'); // Clear subcategory when selecting main category
    
    // Navigate to shop page with the category filter
    navigate(`/shop?${currentParams.toString()}`);
    setIsMenuOpen(false);
  };

  const handleSubcategoryClick = (categorySlug: string, subcategorySlug: string) => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.set('category', categorySlug);
    currentParams.set('subcategory', subcategorySlug);
    
    // Navigate to shop page with the category and subcategory filters
    navigate(`/shop?${currentParams.toString()}`);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold gradient-text font-serif">
              A&Z Fabrics
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-rose-500 transition-colors">
              Home
            </Link>
            
            {/* Categories Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-rose-500 transition-colors">
                    Categories
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[600px] grid-cols-2">
                      {categories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <NavigationMenuLink asChild>
                            <button
                              onClick={() => handleCategoryClick(category.slug)}
                              className="block w-full text-left p-2 hover:bg-gray-50 rounded-md transition-colors font-medium text-gray-900 capitalize"
                            >
                              {category.name}
                            </button>
                          </NavigationMenuLink>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <div className="ml-4 space-y-1">
                              {category.subcategories.map((subcategory) => (
                                <NavigationMenuLink key={subcategory.id} asChild>
                                  <button
                                    onClick={() => handleSubcategoryClick(category.slug, subcategory.slug)}
                                    className="block w-full text-left p-1 hover:bg-gray-50 rounded-md transition-colors text-sm text-gray-600 capitalize"
                                  >
                                    {subcategory.name}
                                  </button>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link to="/shop" className="text-gray-700 hover:text-rose-500 transition-colors">
              Shop
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-rose-500 transition-colors">
              Contact
            </Link>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Order Tracking Icon */}
            <Link to="/track-order" className="text-gray-700 hover:text-rose-500 transition-colors">
              <Package className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-rose-500 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-rose-500">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="hidden lg:flex items-center space-x-2">
                <Link to="/account" className="text-gray-700 hover:text-rose-500 transition-colors">
                  <User className="h-5 w-5" />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-rose-500"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-rose-500 hover:bg-rose-600">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-rose-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {/* Mobile Categories */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-gray-700 font-medium">Categories</div>
                {categories.map((category) => (
                  <div key={category.id} className="ml-4 space-y-1">
                    <button
                      onClick={() => handleCategoryClick(category.slug)}
                      className="block w-full text-left px-3 py-2 text-gray-600 hover:text-rose-500 transition-colors capitalize"
                    >
                      {category.name}
                    </button>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <button
                            key={subcategory.id}
                            onClick={() => handleSubcategoryClick(category.slug, subcategory.slug)}
                            className="block w-full text-left px-3 py-1 text-sm text-gray-500 hover:text-rose-500 transition-colors capitalize"
                          >
                            {subcategory.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Link
                to="/shop"
                className="block px-3 py-2 text-gray-700 hover:text-rose-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-rose-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/track-order"
                className="block px-3 py-2 text-gray-700 hover:text-rose-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Order
              </Link>

              {/* Mobile user menu */}
              {user ? (
                <>
                  <Link
                    to="/account"
                    className="block px-3 py-2 text-gray-700 hover:text-rose-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-rose-500 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-rose-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 text-gray-700 hover:text-rose-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
