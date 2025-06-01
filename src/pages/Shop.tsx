
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SubcategoryFilter from "@/components/SubcategoryFilter";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  stock: number;
  slug: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategories?: {
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
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image_url,
          stock,
          slug,
          categories (
            id,
            name,
            slug
          ),
          subcategories (
            id,
            name,
            slug
          )
        `);

      if (selectedCategory !== "all") {
        query = query.eq('category_id', selectedCategory);
      }

      if (selectedSubcategory !== "all") {
        query = query.eq('subcategory_id', selectedSubcategory);
      }

      // Add sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, sortBy]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("all"); // Reset subcategory when category changes
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-serif mb-8">Shop Our Collection</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subcategory Filter */}
          <SubcategoryFilter
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
          />

          {/* Sort Filter */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
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
                  <div className="p-4">
                    <div className="mb-2">
                      {product.categories && (
                        <Badge variant="secondary" className="text-xs">
                          {product.categories.name}
                        </Badge>
                      )}
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-rose-500 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-bold text-rose-500">
                        PKR {product.price.toLocaleString()}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          PKR {product.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </Badge>
                      <Link to={`/product/${product.id}`}>
                        <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
