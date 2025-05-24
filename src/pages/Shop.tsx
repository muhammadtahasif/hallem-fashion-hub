
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('latest');
  const [priceRange, setPriceRange] = useState([0, 10000]);

  // Mock products data - will be replaced with real data from Supabase
  const mockProducts = [
    {
      id: 1,
      name: "Royal Blue Embroidered Dupatta",
      price: 2500,
      originalPrice: 3000,
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop",
      category: "dupattas",
      inStock: true,
      discount: 17
    },
    {
      id: 2,
      name: "Elegant Pink Lawn Suit",
      price: 4500,
      originalPrice: 5500,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
      category: "ready-made",
      inStock: true,
      discount: 18
    },
    {
      id: 3,
      name: "Premium Silk Fabric",
      price: 1800,
      originalPrice: 2200,
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop",
      category: "unstitched",
      inStock: true,
      discount: 18
    },
    {
      id: 4,
      name: "Chiffon Party Wear",
      price: 6500,
      originalPrice: 8000,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
      category: "ready-made",
      inStock: true,
      discount: 19
    },
    {
      id: 5,
      name: "Golden Thread Dupatta",
      price: 3200,
      originalPrice: 3800,
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop",
      category: "dupattas",
      inStock: true,
      discount: 16
    },
    {
      id: 6,
      name: "Cotton Lawn Unstitched",
      price: 2800,
      originalPrice: 3500,
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop",
      category: "unstitched",
      inStock: false,
      discount: 20
    }
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'dupattas', label: 'Dupattas' },
    { value: 'ready-made', label: 'Ready-Made' },
    { value: 'unstitched', label: 'Unstitched' },
  ];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'discount':
        return b.discount - a.discount;
      default:
        return b.id - a.id; // Latest first
    }
  });

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={category.value}
                checked={selectedCategory === category.value}
                onCheckedChange={(checked) => {
                  setSelectedCategory(checked ? category.value : '');
                }}
              />
              <label htmlFor={category.value} className="text-sm">
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
              className="w-20"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 10000])}
              className="w-20"
            />
          </div>
          <p className="text-xs text-gray-500">
            PKR {priceRange[0].toLocaleString()} - PKR {priceRange[1].toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="in-stock" />
            <label htmlFor="in-stock" className="text-sm">In Stock Only</label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif mb-4">
            {selectedCategory ? categories.find(c => c.value === selectedCategory)?.label : 'All Products'}
          </h1>
          <p className="text-gray-600">
            Discover our collection of premium women's fashion
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="discount">Highest Discount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 shrink-0">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4" />
                <h2 className="font-semibold">Filters</h2>
              </div>
              <FilterContent />
            </Card>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="mt-6">
                  <h2 className="font-semibold mb-4">Filters</h2>
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {sortedProducts.length} of {mockProducts.length} products
              </p>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setPriceRange([0, 10000]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.discount > 0 && (
                          <Badge className="absolute top-2 left-2 bg-rose-500">
                            -{product.discount}%
                          </Badge>
                        )}
                        {!product.inStock && (
                          <Badge variant="secondary" className="absolute top-2 right-2">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 group-hover:text-rose-500 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-rose-500">
                              PKR {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                PKR {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {product.category.replace('-', ' ')}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
