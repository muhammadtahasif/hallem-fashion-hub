
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Category image mapping
  const categoryImages = {
    suits: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=300&fit=crop",
    shirts: "https://images.unsplash.com/photo-1586449935794-f1247afc0d29?w=500&h=300&fit=crop",
    dupatta: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=300&fit=crop",
    kurti: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=500&h=300&fit=crop",
    palazzo: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=300&fit=crop",
    accessories: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=300&fit=crop"
  };

  const getCategoryImage = (slug: string) => {
    return categoryImages[slug] || "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=300&fit=crop";
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(4);

      if (productsError) throw productsError;

      // Fetch categories
      const { data: cats, error: catsError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (catsError) throw catsError;

      setFeaturedProducts(products || []);
      setCategories(cats || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section - Full Width */}
      <section className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&h=800&fit=crop" 
            alt="A&Z Fabrics Collection" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20" />
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-wide">
              A&Z FABRICS
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 font-light tracking-wide">
              YOUR FAVORITE COLLECTION
            </p>
            <Link to="/shop">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-medium tracking-wide"
              >
                SHOP NOW
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section - Circular Style like Nishat */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">          
          {/* Categories Grid - Circular Style */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {categories.map(category => (
              <Link key={category.id} to={`/shop?category=${category.slug}`} className="group">
                <div className="text-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-4 overflow-hidden rounded-full group-hover:shadow-xl transition-all duration-300">
                    <img 
                      src={getCategoryImage(category.slug)} 
                      alt={category.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
                  </div>
                  <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-800 capitalize group-hover:text-rose-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-wide">FEATURED COLLECTION</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked pieces from our latest collection
            </p>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.map(product => {
              const discount = calculateDiscount(product.price, product.original_price);
              return (
                <div key={product.id} className="group">
                  <div className="bg-white border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <Link to={`/product/${product.id}`}>
                      <div className="relative overflow-hidden">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-48 md:h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        {discount > 0 && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-red-600 text-white text-xs font-medium">
                              -{discount}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-3 lg:p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-medium mb-2 group-hover:text-rose-600 transition-colors text-sm lg:text-base line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-black">
                            PKR {product.price.toLocaleString()}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              PKR {product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/shop">
              <Button 
                variant="outline" 
                size="lg"
                className="border-black text-black hover:bg-black hover:text-white px-8 py-3 font-medium tracking-wide"
              >
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=400&fit=crop" 
                alt="About A&Z Fabrics" 
                className="w-full h-auto" 
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-wide">ABOUT A&Z FABRICS</h2>
              <p className="text-gray-700 leading-relaxed">
                At A&Z Fabrics, we believe in celebrating the beauty of traditional craftsmanship 
                while embracing modern design sensibilities. Our collection features carefully 
                curated pieces that reflect elegance, comfort, and style.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Every garment tells a story of skilled artisanship, quality materials, and 
                attention to detail. We're committed to bringing you fashion that not only 
                looks beautiful but feels extraordinary.
              </p>
              <Link to="/contact">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-black text-black hover:bg-black hover:text-white px-6 py-3 font-medium tracking-wide"
                >
                  LEARN MORE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
