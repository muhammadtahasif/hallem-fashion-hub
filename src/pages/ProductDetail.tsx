
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowLeft, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import RelatedProducts from "@/components/RelatedProducts";
import RandomProducts from "@/components/RandomProducts";
import BuyNowButton from "@/components/BuyNowButton";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  image_url: string;
  images?: string[];
  category_id?: string;
  stock: number;
  featured: boolean;
  slug: string;
  sku: string;
  categories?: {
    name: string;
    slug: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Product not found.",
          variant: "destructive",
        });
        navigate('/shop');
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product!.id, quantity);
  };

  const handleWishlist = () => {
    toast({
      title: "Added to wishlist",
      description: "Item saved to your wishlist.",
    });
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const formatDescription = (text?: string) => {
    if (!text) return '';
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/\n/g, '<br />');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate('/shop')} className="bg-rose-500 hover:bg-rose-600">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(product.price, product.original_price);
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image_url];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-0 h-auto font-normal text-gray-600 hover:text-rose-500">
            Home
          </Button>
          <span>/</span>
          <Button variant="ghost" onClick={() => navigate('/shop')} className="p-0 h-auto font-normal text-gray-600 hover:text-rose-500">
            Shop
          </Button>
          {product.categories && (
            <>
              <span>/</span>
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/shop?category=${product.categories?.slug}`)} 
                className="p-0 h-auto font-normal text-gray-600 hover:text-rose-500 capitalize"
              >
                {product.categories.name}
              </Button>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <Button variant="ghost" onClick={() => navigate('/shop')} className="mb-6 p-0 text-gray-600 hover:text-rose-500">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <div className="aspect-square w-full max-w-lg mx-auto overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={productImages[selectedImage] || product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-rose-500 text-white">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden aspect-square ${
                      selectedImage === index ? 'border-rose-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain hover:scale-105 transition-transform bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">{product.name}</h1>
              <p className="text-gray-600">SKU: {product.sku}</p>
              {product.categories && (
                <p className="text-gray-600 capitalize">{product.categories.name}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-rose-500">
                PKR {product.price.toLocaleString()}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  PKR {product.original_price.toLocaleString()}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="destructive">
                  Save PKR {((product.original_price || 0) - product.price).toLocaleString()}
                </Badge>
              )}
            </div>

            {product.description && (
              <div 
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formatDescription(product.description) }}
              />
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">In Stock ({product.stock} items)</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={product.stock === 0}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={product.stock === 0}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <BuyNowButton
                productId={product.id}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 text-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Button>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts 
          currentProductId={product.id} 
          categoryId={product.category_id} 
        />

        <RandomProducts 
          currentProductId={product.id} 
          limit={3}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
