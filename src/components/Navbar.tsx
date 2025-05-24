
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems] = useState(0); // Will be connected to cart context later
  const location = useLocation();
  const { toast } = useToast();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Dupattas", href: "/shop?category=dupattas" },
    { name: "Ready-Made", href: "/shop?category=ready-made" },
    { name: "Unstitched", href: "/shop?category=unstitched" },
    { name: "Contact", href: "/contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to shop with search query
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-gold-500 text-white text-center py-2 text-sm">
        Free shipping on orders above PKR 2000 | Contact: +92 3090449955
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold gradient-text font-serif">
              AL - HALLEM
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                  isActive(item.href) ? "text-rose-500" : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-32">
                <form onSubmit={handleSearch} className="flex items-center space-x-2 mt-4">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    Search
                  </Button>
                </form>
              </SheetContent>
            </Sheet>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                  {cartItems}
                </Badge>
              )}
            </Button>

            {/* User Account */}
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline ml-2">Account</span>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-lg font-medium transition-colors hover:text-rose-500 ${
                        isActive(item.href) ? "text-rose-500" : "text-gray-600"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                    <Link to="/track-order" className="text-lg font-medium text-gray-600 hover:text-rose-500">
                      Track Order
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
