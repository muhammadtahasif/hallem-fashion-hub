
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Minus, Plus, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BuyNowButton from "@/components/BuyNowButton";
import RelatedProducts from "@/components/RelatedProducts";
import ProductImageGallery from "@/components/ProductImageGallery";
import { formatDescription } from "@/utils/textFormatting";

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  image_url: string;
  images?: string[];
  featured: boolean;
  sku: string;
  sold_out: boolean;
  categories?: {
    id: string;
    name: string;
  };
  variants?: ProductVariant[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('id', id)
        .eq('is_visible', true)
        .single();

      if (error) throw error;

      // Fetch variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id);

      if (variantsError) throw variantsError;

      const productWithVariants = {
        ...data,
        variants: variantsData || []
      };

      setProduct(productWithVariants);

      // Set default selections if variants exist
      if (variantsData && variantsData.length > 0) {
        const firstVariant = variantsData[0];
        setSelectedColor(firstVariant.color);
        setSelectedSize(firstVariant.size);
        setSelectedVariant(firstVariant);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details.",
        variant: "destructive"
      });
      navigate('/shop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Check if variants exist and if one is selected
    if (product.variants && product.variants.length > 0) {
      if (!selectedVariant) {
        toast({
          title: "Selection Required",
          description: "Please select color and size before adding to cart.",
          variant: "destructive"
        });
        return;
      }

      if (quantity > selectedVariant.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${selectedVariant.stock} items available for this variant.`,
          variant: "destructive"
        });
        return;
      }

      addToCart(product.id, quantity, selectedVariant.id, selectedColor, selectedSize);
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} (${selectedColor}, ${selectedSize}) added to your cart.`,
        variant: "default"
      });
    } else {
      // Fallback for products without variants
      if (quantity > product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} items available in stock.`,
          variant: "destructive"
        });
        return;
      }

      addToCart(product.id, quantity);
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added to your cart.`,
        variant: "default"
      });
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product?.name} ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
      variant: "default"
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxStock = selectedVariant ? selectedVariant.stock : (product?.stock || 0);
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantSelection = (color: string, size: string) => {
    setSelectedColor(color);
    setSelectedSize(size);
    
    if (product?.variants) {
      const variant = product.variants.find(v => v.color === color && v.size === size);
      setSelectedVariant(variant || null);
      
      // Reset quantity to 1 when variant changes
      setQuantity(1);
    }
  };

  const getAvailableColors = () => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map(v => v.color))];
  };

  const getAvailableSizes = (color: string) => {
    if (!product?.variants) return [];
    return product.variants
      .filter(v => v.color === color)
      .map(v => v.size);
  };

  const getCurrentPrice = () => {
    return selectedVariant ? selectedVariant.price : product?.price || 0;
  };

  const getCurrentStock = () => {
    return selectedVariant ? selectedVariant.stock : product?.stock || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate('/shop')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  // Prepare images array for the gallery
  const galleryImages = [product.image_url];
  if (product.images && product.images.length > 0) {
    galleryImages.push(...product.images);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/shop')}
          className="mb-4 sm:mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8 lg:mb-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery
              images={galleryImages}
              productName={product.name}
            />
            
            {/* Mobile: Tap to zoom hint */}
            <p className="text-xs sm:text-sm text-gray-500 text-center mt-2 lg:hidden">
              Tap image to zoom and view in full screen
            </p>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">
                  {product.name}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWishlist}
                  className={`w-fit ${isWishlisted ? 'text-red-500 border-red-500' : 'text-gray-500'}`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              {product.categories && (
                <Badge variant="secondary" className="mb-3">
                  {product.categories.name}
                </Badge>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-rose-600">
                  PKR {getCurrentPrice().toLocaleString()}
                </span>
                {product.original_price && product.original_price > getCurrentPrice() && (
                  <span className="text-lg text-gray-500 line-through">
                    PKR {product.original_price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600 mb-4">
                <span>SKU: {selectedVariant ? selectedVariant.sku : product.sku}</span>
                <span className="hidden sm:inline">•</span>
                <span className={getCurrentStock() > 0 ? 'text-green-600' : 'text-red-600'}>
                  {getCurrentStock() > 0 ? `${getCurrentStock()} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div className="text-gray-700 leading-relaxed">
                  {formatDescription(product.description)}
                </div>
              </div>
            )}

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableColors().map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          const sizes = getAvailableSizes(color);
                          if (sizes.length > 0) {
                            handleVariantSelection(color, sizes[0]);
                          }
                        }}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                          selectedColor === color
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-white text-gray-900 border-gray-300 hover:border-rose-500'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedColor && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableSizes(selectedColor).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleVariantSelection(selectedColor, size)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                            selectedSize === size
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-rose-500'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVariant && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      Selected: <span className="font-medium">{selectedColor}</span> - <span className="font-medium">{selectedSize}</span>
                    </p>
                    <p className="text-lg font-bold text-rose-600">
                      PKR {selectedVariant.price.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            {getCurrentStock() > 0 && !product.sold_out && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={getCurrentStock()}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= getCurrentStock()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="bg-rose-500 hover:bg-rose-600 w-full"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <BuyNowButton 
                    productId={product.id} 
                    className="w-full"
                    quantity={quantity}
                    variantId={selectedVariant?.id}
                    selectedColor={selectedColor}
                    selectedSize={selectedSize}
                    isSoldOut={product.sold_out}
                  />
                </div>
              </div>
            )}

            {(getCurrentStock() === 0 || product.sold_out) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 font-medium">
                  {product.sold_out ? 'This product is sold out.' : 'This product is currently out of stock.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts 
          categoryId={product.categories?.id} 
          currentProductId={product.id} 
        />
      </div>
    </div>
  );
};

export default ProductDetail;
