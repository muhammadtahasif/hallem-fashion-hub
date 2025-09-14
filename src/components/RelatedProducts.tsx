
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

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
}

const RelatedProducts = ({ currentProductId, categoryId }: RelatedProductsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      
      // First try to get products from the same category
      let query = supabase
        .from('products')
        .select('id, name, price, original_price, image_url, slug')
        .neq('id', currentProductId)
        .eq('is_visible', true)
        .gt('stock', 0)
        .limit(8);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: categoryProducts, error: categoryError } = await query;

      if (categoryError) {
        console.error('Error fetching category products:', categoryError);
      }

      let products = categoryProducts || [];

      // If we don't have enough products from the same category, get random products
      if (products.length < 4) {
        const { data: randomProducts, error: randomError } = await supabase
          .from('products')
          .select('id, name, price, original_price, image_url, slug')
          .neq('id', currentProductId)
          .eq('is_visible', true)
          .gt('stock', 0)
          .limit(8 - products.length);

        if (randomError) {
          console.error('Error fetching random products:', randomError);
        } else if (randomProducts) {
          // Filter out products that are already in the category products
          const existingIds = products.map(p => p.id);
          const additionalProducts = randomProducts.filter(p => !existingIds.includes(p.id));
          products = [...products, ...additionalProducts];
        }
      }

      // Shuffle and take only 4 products
      const shuffledProducts = products.sort(() => 0.5 - Math.random()).slice(0, 4);
      setRelatedProducts(shuffledProducts);
    } catch (error) {
      console.error('Error fetching related products:', error);
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
        <h2 className="text-2xl font-bold font-serif mb-8">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
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

  if (relatedProducts.length === 0) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold font-serif mb-8">Related Products</h2>
        <p className="text-gray-500 text-center py-8">No related products found.</p>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold font-serif mb-8">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {relatedProducts.map((product) => (
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
              <div className="p-2 sm:p-3 md:p-4">
                <h3 className="font-medium mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base">{product.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                  <span className="text-sm sm:text-lg font-bold text-rose-500">
                    PKR {product.price.toLocaleString()}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                      PKR {product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
                <Button 
                  size="sm"
                  className="w-full text-xs sm:text-sm bg-rose-500 hover:bg-rose-600"
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

export default RelatedProducts;
