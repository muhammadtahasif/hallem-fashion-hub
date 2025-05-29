import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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
  ChevronDown,
  LogOut,
  Package
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();

  useEffect(() => {
    fetchCategoriesAndSubcategories();
    
    // Set up real-time subscription for categories and subcategories
    const channel = supabase
      .channel('navbar-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          console.log('Categories changed:', payload);
          fetchCategoriesAndSubcategories();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subcategories' },
        (payload) => {
          console.log('Subcategories changed:', payload);
          fetchCategoriesAndSubcategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCategoriesAndSubcategories = async () => {
    try {
      const [categoriesData, subcategoriesData] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name')
      ]);

      if (categoriesData.error) throw categoriesData.error;
      if (subcategoriesData.error) throw subcategoriesData.error;

      console.log('Fetched categories:', categoriesData.data);
      console.log('Fetched subcategories:', subcategoriesData.data);
      
      setCategories(categoriesData.data || []);
      setSubcategories(subcategoriesData.data || []);
    } catch (error) {
      console.error('Error fetching categories and subcategories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCategoryClick = (categorySlug: string) => {
    console.log('Category clicked:', categorySlug);
    navigate(`/shop?category=${categorySlug}`);
  };

  const handleSubcategoryClick = (subcategorySlug: string) => {
    console.log('Subcategory clicked:', subcategorySlug);
    navigate(`/shop?subcategory=${subcategorySlug}`);
  };

  const getCategorySubcategories = (categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold font-serif text-rose-500">
            A&Z Fabrics
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-rose-500 transition-colors">
              Home
            </Link>
            
            {/* Categories Navigation Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-rose-500 transition-colors bg-transparent">
                    Categories
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white border shadow-lg p-4 min-w-[300px]">
                    <div className="grid gap-2">
                      <button
                        onClick={() => handleCategoryClick('')}
                        className="text-left px-3 py-2 hover:bg-gray-100 rounded-md font-medium"
                      >
                        All Products
                      </button>
                      {categories.map((category) => {
                        const categorySubcategories = getCategorySubcategories(category.id);
                        
                        if (categorySubcategories.length > 0) {
                          return (
                            <div key={category.id} className="space-y-1">
                              <button
                                onClick={() => handleCategoryClick(category.slug)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md font-medium capitalize"
                              >
                                {category.name}
                              </button>
                              <div className="ml-4 space-y-1">
                                {categorySubcategories.map((subcategory) => (
                                  <button
                                    key={subcategory.id}
                                    onClick={() => handleSubcategoryClick(subcategory.slug)}
                                    className="w-full text-left px-3 py-1 text-sm text-gray-600 hover:text-rose-500 hover:bg-gray-50 rounded-md capitalize"
                                  >
                                    {subcategory.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.slug)}
                              className="text-left px-3 py-2 hover:bg-gray-100 rounded-md capitalize"
                            >
                              {category.name}
                            </button>
                          );
                        }
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link to="/contact" className="text-gray-700 hover:text-rose-500 transition-colors">
              Contact
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-md mx-4 flex-1">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Order Tracking */}
            <Link to="/track-order">
              <Button variant="ghost" size="sm" className="relative">
                <Package className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  {user.email === 'digitaleyemedia25@gmail.com' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4"
                      />
                    </div>
                  </form>
                  
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                    Home
                  </Link>
                  
                  <div className="space-y-2">
                    <p className="font-semibold">Categories</p>
                    <button
                      onClick={() => {
                        handleCategoryClick('');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block pl-4 text-gray-600 text-left w-full"
                    >
                      All Products
                    </button>
                    {categories.map((category) => {
                      const categorySubcategories = getCategorySubcategories(category.id);
                      
                      return (
                        <div key={category.id} className="space-y-1">
                          <button
                            onClick={() => {
                              handleCategoryClick(category.slug);
                              setIsMobileMenuOpen(false);
                            }}
                            className="block pl-4 text-gray-600 capitalize text-left w-full font-medium"
                          >
                            {category.name}
                          </button>
                          {categorySubcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() => {
                                handleSubcategoryClick(subcategory.slug);
                                setIsMobileMenuOpen(false);
                              }}
                              className="block pl-8 text-gray-500 capitalize text-left w-full text-sm"
                            >
                              {subcategory.name}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  
                  <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                    Contact
                  </Link>

                  <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)}>
                    Track Order
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
