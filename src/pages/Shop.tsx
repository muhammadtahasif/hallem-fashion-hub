
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, ShoppingCart } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import SubcategoryFilterProfessional from "@/components/SubcategoryFilterProfessional";
import CategoryFilter from "@/components/CategoryFilter";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  category_id: string;
  subcategory_id?: string;
  featured: boolean;
  stock: number;
  categories?: {
    id: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const categorySlug = searchParams.get('category');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Set category from URL params
    if (categorySlug && categories.length > 0) {
      const selectedCategory = categories.find(cat => cat.slug === categorySlug);
      if (selectedCategory) {
        setSelectedCategoryId(selectedCategory.id);
      }
    }
  }, [categorySlug, categories]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategoryId, selectedSubcategories]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .gt('stock', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by selected category
    if (selectedCategoryId) {
      filtered = filtered.filter(product => product.category_id === selectedCategoryId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected subcategories
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter(product =>
        product.subcategory_id && selectedSubcategories.includes(product.subcategory_id)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-2 md:px-4">
        <h1 className="text-2xl md:text-3xl font-bold font-serif mb-4 md:mb-8">Shop</h1>

        {/* Search Bar */}
        <div className="mb-4 md:mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <CategoryFilter
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={setSelectedCategoryId}
            />
            
            <SubcategoryFilterProfessional
              selectedSubcategories={selectedSubcategories}
              onSubcategoryChange={setSelectedSubcategories}
              selectedCategory={selectedCategoryId}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-gray-600 text-sm md:text-base">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Mobile: 2 products per row, Desktop: 3 products per row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <Link to={`/product/${product.id}`}>
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <div className="p-2 md:p-4">
                      <div className="flex items-start justify-between mb-1 md:mb-2 gap-1">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-semibold text-xs md:text-lg hover:text-rose-500 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        {product.featured && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0 hidden md:flex">
                            <Star className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 md:gap-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs md:text-lg font-bold text-rose-500">
                            PKR {product.price.toLocaleString()}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-xs text-gray-500 line-through">
                              PKR {product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          className="bg-rose-500 hover:bg-rose-600 text-xs px-2 py-1 w-full"
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg md:text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 text-sm md:text-base">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
