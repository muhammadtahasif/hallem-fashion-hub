
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import ProductSearchWithSKU from "@/components/ProductSearchWithSKU";
import SubcategoryFilter from "@/components/SubcategoryFilter";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  slug: string;
  sku: string;
  stock: number;
  categories?: {
    name: string;
    slug: string;
  };
  subcategories?: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("name");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    
    // Get category from URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, selectedSubcategory, sortBy, searchResults, isSearching]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image_url,
          slug,
          sku,
          stock,
          categories (
            name,
            slug
          ),
          subcategories (
            name,
            slug
          )
        `)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = isSearching ? searchResults : products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.categories?.slug === selectedCategory
      );
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(product => 
        product.subcategories?.id === selectedSubcategory
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setSelectedSubcategory(null); // Reset subcategory when category changes
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (categorySlug) {
      newParams.set('category', categorySlug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
  };

  const handleSearchResults = (results: Product[]) => {
    setSearchResults(results);
    setIsSearching(results.length > 0);
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Get selected category ID for subcategory filter
  const selectedCategoryData = categories.find(cat => cat.slug === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-serif mb-8">Shop Our Collection</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Search */}
                <div>
                  <h3 className="font-medium mb-3">Search Products</h3>
                  <ProductSearchWithSKU 
                    onSearchResults={handleSearchResults}
                    placeholder="Search by name or SKU..."
                  />
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === "" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleCategoryChange("")}
                    >
                      All Categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.slug ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handleCategoryChange(category.slug)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Subcategories */}
                <SubcategoryFilter
                  selectedCategoryId={selectedCategoryData?.id}
                  selectedSubcategoryId={selectedSubcategory}
                  onSubcategorySelect={setSelectedSubcategory}
                />

                {/* Sort */}
                <div>
                  <h3 className="font-medium mb-3">Sort By</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const discount = calculateDiscount(product.price, product.original_price);
                  
                  return (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="relative">
                          <Link to={`/product/${product.id}`}>
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-64 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          {discount > 0 && (
                            <Badge className="absolute top-2 left-2 bg-rose-500">
                              -{discount}% OFF
                            </Badge>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                              <Badge variant="destructive">Out of Stock</Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-semibold mb-2 hover:text-rose-500 transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          
                          <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                          
                          {product.categories && (
                            <p className="text-sm text-gray-500 mb-2 capitalize">
                              {product.categories.name}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold text-rose-500">
                              PKR {product.price.toLocaleString()}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                PKR {product.original_price.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <Button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0}
                            className="w-full bg-rose-500 hover:bg-rose-600"
                          >
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
