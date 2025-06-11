
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  featured: boolean;
  stock: number;
  categories?: {
    name: string;
  };
}

const RandomProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchRandomProducts();
  }, []);

  const fetchRandomProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('featured', true)
        .gt('stock', 0)
        .limit(8);

      if (error) throw error;

      // Shuffle the array and take first 8 items
      const shuffled = (data || []).sort(() => 0.5 - Math.random());
      setProducts(shuffled.slice(0, 8));
    } catch (error) {
      console.error('Error fetching random products:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium fabrics and materials
          </p>
        </div>

        {/* Mobile: 2 products per row, Desktop: 4 products per row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map((product) => (
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
                      <h3 className="font-semibold text-xs md:text-base hover:text-rose-500 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <Badge variant="secondary" className="text-xs flex-shrink-0 hidden md:flex">
                      <Star className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col gap-1 md:gap-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs md:text-base font-bold text-rose-500">
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

        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link to="/shop">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RandomProducts;
