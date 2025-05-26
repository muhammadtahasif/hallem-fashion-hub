
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  categories?: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image_url,
          categories (
            name,
            slug
          )
        `)
        .eq('featured', true)
        .limit(4);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

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

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const getCategoryImage = (slug: string) => {
    const imageMap: { [key: string]: string } = {
      'dupattas': 'photo-1583391733956-6c78276477e2',
      'ready-made': 'photo-1434389677669-e08b4cac3105',
      'unstitched': 'photo-1558769132-cb1aea458c5e',
      'hijabs': 'photo-1544957992-20514f595d6f',
      'scarves': 'photo-1515372039744-b8f02a3ae446'
    };
    
    const imageId = imageMap[slug] || 'photo-1434389677669-e08b4cac3105';
    return `https://images.unsplash.com/${imageId}?w=500&h=600&fit=crop`;
  };

  return (
    <div className="fashion-gradient">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop')"
        }}>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 animate-fade-in">
            AL - HALLEM
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in">
            Discover Exquisite Women's Fashion
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            From elegant dupattas to premium unstitched fabrics and ready-made collections. 
            Experience the finest in Pakistani women's fashion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 text-lg">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/shop?category=dupattas">
              <Button variant="outline" size="lg" className="border-white hover:bg-white px-8 py-3 text-lg text-zinc-900">
                View Dupattas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collections of premium women's fashion essentials
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map(category => (
              <Link key={category.id} to={`/shop?category=${category.slug}`} className="group">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="relative">
                    <img 
                      src={getCategoryImage(category.slug)}
                      alt={category.name} 
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-semibold font-serif">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked selections from our latest arrivals and bestsellers
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => {
              const discount = calculateDiscount(product.price, product.original_price);
              return (
                <div key={product.id} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <Link to={`/product/${product.id}`}>
                      <div className="relative">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {discount > 0 && (
                          <Badge className="absolute top-2 left-2 bg-rose-500">
                            -{discount}%
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold mb-2 group-hover:text-rose-500 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between mb-3">
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
                      </div>
                      <Button 
                        onClick={() => addToCart(product.id)}
                        className="w-full bg-rose-500 hover:bg-rose-600"
                        size="sm"
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link to="/shop">
              <Button size="lg" variant="outline" className="hover:bg-rose-500 hover:text-white">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-rose-500 to-gold-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold font-serif mb-4">Join Our Fashion Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be the first to know about new arrivals, exclusive offers, and fashion tips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white" 
            />
            <Button className="bg-white text-rose-500 hover:bg-gray-100 px-8 py-3">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
