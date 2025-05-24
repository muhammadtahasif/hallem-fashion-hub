
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowLeft, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Mock product data - will be replaced with real data from Supabase
  const product = {
    id: 1,
    name: "Royal Blue Embroidered Dupatta",
    price: 2500,
    originalPrice: 3000,
    description: "Experience elegance with this exquisite royal blue dupatta featuring intricate gold embroidery. Crafted from premium chiffon fabric, this piece adds a touch of sophistication to any outfit. Perfect for weddings, parties, and special occasions.",
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop&brightness=110",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop&brightness=90"
    ],
    category: "dupattas",
    inStock: true,
    stock: 15,
    discount: 17,
    features: [
      "Premium chiffon fabric",
      "Hand-embroidered gold work",
      "Machine washable",
      "2.5 meters length",
      "Traditional Pakistani design"
    ],
    care: [
      "Dry clean recommended",
      "Iron on low heat",
      "Store in a cool, dry place",
      "Avoid direct sunlight"
    ]
  };

  const relatedProducts = [
    {
      id: 2,
      name: "Golden Thread Dupatta",
      price: 3200,
      originalPrice: 3800,
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop&hue=30",
      discount: 16
    },
    {
      id: 3,
      name: "Silver Embroidered Dupatta",
      price: 2800,
      originalPrice: 3300,
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop&hue=60",
      discount: 15
    },
    {
      id: 4,
      name: "Rose Pink Dupatta",
      price: 2200,
      originalPrice: 2600,
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop&hue=300",
      discount: 15
    }
  ];

  const handleBuyNow = () => {
    // This will redirect to login if user is not authenticated
    toast({
      title: "Redirecting to checkout",
      description: "Please login to continue with your purchase.",
    });
    // Redirect to login with return URL
    window.location.href = `/login?redirect=/product/${id}&action=buy&quantity=${quantity}`;
  };

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity} item(s) added to your cart.`,
    });
  };

  const handleWishlist = () => {
    toast({
      title: "Added to wishlist",
      description: "Item saved to your wishlist.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-rose-500">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-rose-500">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-rose-500 capitalize">
            {product.category.replace('-', ' ')}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 lg:h-[600px] object-cover rounded-lg"
              />
              {product.discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-rose-500 text-white">
                  -{product.discount}% OFF
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'border-rose-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-24 object-cover hover:scale-105 transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">{product.name}</h1>
              <p className="text-gray-600 capitalize">{product.category.replace('-', ' ')}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-rose-500">
                PKR {product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  PKR {product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.discount > 0 && (
                <Badge variant="destructive">
                  Save PKR {(product.originalPrice - product.price).toLocaleString()}
                </Badge>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
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
                  disabled={!product.inStock}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={!product.inStock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 text-lg"
              >
                Buy Now
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
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

            <Separator />

            {/* Product Features */}
            <div>
              <h3 className="font-semibold mb-3">Product Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Care Instructions */}
            <div>
              <h3 className="font-semibold mb-3">Care Instructions</h3>
              <ul className="space-y-2">
                {product.care.map((instruction, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-gold-500 rounded-full"></div>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold font-serif mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {relatedProduct.discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-rose-500">
                        -{relatedProduct.discount}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-rose-500 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-rose-500">
                        PKR {relatedProduct.price.toLocaleString()}
                      </span>
                      {relatedProduct.originalPrice > relatedProduct.price && (
                        <span className="text-sm text-gray-500 line-through">
                          PKR {relatedProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
