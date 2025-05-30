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
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  image_url: string;
  stock: number;
  category_id: string;
  categories?: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    // Set up real-time subscription for categories
    const channel = supabase
      .channel('shop-categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          console.log('Categories changed in shop, refetching...');
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categories]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    setSearchParams(params);
    
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedSubcategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      console.log('Fetched categories in shop:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchProducts = async () => {
    if (categories.length === 0) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          original_price,
          image_url,
          stock,
          category_id,
          subcategory_id,
          sku,
          categories (
            name,
            slug
          )
        `);

      // Apply filters - filter by category if one is selected
      if (selectedCategory && selectedCategory !== '') {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      // Apply subcategory filter
      if (selectedSubcategory && selectedSubcategory !== '') {
        const subcategory = subcategories.find(s => s.slug === selectedSubcategory);
        if (subcategory) {
          query = query.eq('subcategory_id', subcategory.id);
        }
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply price range filter
      const filteredData = data?.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      ) || [];

      console.log('Filtered products:', filteredData);
      setProducts(filteredData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat.slug, label: cat.name }))
  ];

  const subcategoryOptions = [
    { value: '', label: 'All Subcategories' },
    ...subcategories.map(sub => ({ value: sub.slug, label: sub.name }))
  ];

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categoryOptions.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={category.value}
                checked={selectedCategory === category.value}
                onCheckedChange={(checked) => {
                  setSelectedCategory(checked ? category.value : '');
                }}
              />
              <label htmlFor={category.value} className="text-sm capitalize">
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Subcategories</h3>
        <div className="space-y-2">
          {subcategoryOptions.map((subcategory) => (
            <div key={subcategory.value} className="flex items-center space-x-2">
              <Checkbox
                id={`sub-${subcategory.value}`}
                checked={selectedSubcategory === subcategory.value}
                onCheckedChange={(checked) => {
                  setSelectedSubcategory(checked ? subcategory.value : '');
                }}
              />
              <label htmlFor={`sub-${subcategory.value}`} className="text-sm capitalize">
                {subcategory.label}
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
          <Button 
            size="sm" 
            onClick={fetchProducts}
            className="bg-rose-500 hover:bg-rose-600"
          >
            Apply
          </Button>
          <p className="text-xs text-gray-500">
            PKR {priceRange[0].toLocaleString()} - PKR {priceRange[1].toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  const getCurrentCategoryName = () => {
    if (!selectedCategory) return 'All Products';
    const category = categories.find(c => c.slug === selectedCategory);
    return category ? category.name : 'Products';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif mb-4 capitalize">
            {getCurrentCategoryName()}
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
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
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
                Showing {products.length} products
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                    setPriceRange([0, 10000]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const discount = calculateDiscount(product.price, product.original_price);
                  return (
                    <div key={product.id} className="group">
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                        <Link to={`/product/${product.id}`}>
                          <div className="relative">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {discount > 0 && (
                              <Badge className="absolute top-2 left-2 bg-rose-500">
                                -{discount}%
                              </Badge>
                            )}
                            {product.stock === 0 && (
                              <Badge variant="secondary" className="absolute top-2 right-2">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </Link>
                        <CardContent className="p-4">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-semibold mb-2 group-hover:text-rose-500 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-rose-500">
                                PKR {product.price.toLocaleString()}
                              </span>
                              {product.original_price && product.original_price > product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  PKR {product.original_price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-3 capitalize">
                            {product.categories?.name}
                          </p>
                          <Button 
                            onClick={() => addToCart(product.id)}
                            disabled={product.stock === 0}
                            className="w-full bg-rose-500 hover:bg-rose-600"
                            size="sm"
                          >
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
