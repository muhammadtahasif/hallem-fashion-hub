
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  slug: string;
}

interface RandomProductsProps {
  currentProductId: string;
  limit?: number;
}

const RandomProducts = ({ currentProductId, limit = 3 }: RandomProductsProps) => {
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRandomProducts();
  }, [currentProductId]);

  const fetchRandomProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, original_price, image_url, slug')
        .neq('id', currentProductId)
        .limit(20); // Get more products to randomize from

      if (error) {
        console.error('Error fetching random products:', error);
        return;
      }

      // Shuffle the products and take the required limit
      const shuffled = data?.sort(() => 0.5 - Math.random()) || [];
      setRandomProducts(shuffled.slice(0, limit));
    } catch (error) {
      console.error('Error fetching random products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold font-serif mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (randomProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold font-serif mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {randomProducts.map((product) => (
          <Card 
            key={product.id} 
            className="group hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
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
                <Button 
                  className="w-full mt-3 bg-rose-500 hover:bg-rose-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RandomProducts;
