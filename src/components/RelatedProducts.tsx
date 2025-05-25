
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  slug: string;
}

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
}

const RelatedProducts = ({ currentProductId, categoryId }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select('id, name, price, original_price, image_url, slug')
          .neq('id', currentProductId)
          .limit(4);

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart(productId);
      toast({
        title: "Added to cart",
        description: `${productName} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-300 h-4 rounded mb-2"></div>
            <div className="bg-gray-300 h-4 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No related products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <Link to={`/product/${product.id}`}>
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-sm mb-2 hover:text-rose-500 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-rose-500 font-bold">
                    PKR {product.price.toLocaleString()}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-gray-400 line-through text-sm">
                      PKR {product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleAddToCart(product.id, product.name)}
                className="w-full bg-rose-500 hover:bg-rose-600 text-xs"
                size="sm"
              >
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RelatedProducts;
