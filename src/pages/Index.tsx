
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] lg:min-h-[70vh] bg-gradient-to-r from-rose-50 to-pink-50 flex items-center py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="space-y-4 lg:space-y-6 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-serif text-gray-900 leading-tight">
                Elegant Fashion
                <span className="text-rose-500 block">Collection</span>
              </h1>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Discover timeless pieces that blend tradition with contemporary style. 
                Each garment is crafted with precision and attention to detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/shop">
                  <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 w-full sm:w-auto">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <img 
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop" 
                  alt="Fashion Collection" 
                  className="w-full h-auto rounded-lg shadow-xl object-cover aspect-[3/4]" 
                />
                <div className="absolute -bottom-3 -left-3 lg:-bottom-4 lg:-left-4 bg-white p-3 lg:p-4 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-xs lg:text-sm">4.9/5</span>
                  </div>
                  <p className="text-xs text-gray-600">1000+ Happy Customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Updated for better mobile responsive */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm lg:text-base">
              Explore our curated collections designed for the modern woman
            </p>
          </div>
          
          {/* Mobile: 2 columns, Tablet: 2 columns, Desktop: 3 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {categories.map(category => (
              <Link key={category.id} to={`/shop?category=${category.slug}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-32 sm:h-40 lg:h-64 overflow-hidden">
                    <img 
                      src={getCategoryImage(category.slug)} 
                      alt={category.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-white text-sm sm:text-lg lg:text-2xl font-bold font-serif capitalize text-center px-2">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Updated for better mobile responsive */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm lg:text-base">
              Handpicked pieces from our latest collection
            </p>
          </div>
          
          {/* Mobile: 2 columns, Tablet: 2 columns, Desktop: 3-4 columns */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-8">
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
                          className="w-full h-32 sm:h-40 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {discount > 0 && (
                          <Badge className="absolute top-1 left-1 lg:top-2 lg:left-2 bg-rose-500 text-xs">
                            -{discount}%
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-2 sm:p-3 lg:p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold mb-1 lg:mb-2 group-hover:text-rose-500 transition-colors text-xs sm:text-sm lg:text-base line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-rose-500">
                          PKR {product.price.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            PKR {product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-8 lg:mt-12">
            <Link to="/shop">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Keep existing code */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=400&fit=crop" 
                alt="About A&Z Fabrics" 
                className="rounded-lg shadow-lg w-full h-auto" 
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold font-serif">About A&Z Fabrics</h2>
              <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                At A&Z Fabrics, we believe in celebrating the beauty of traditional craftsmanship 
                while embracing modern design sensibilities. Our collection features carefully 
                curated pieces that reflect elegance, comfort, and style.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                Every garment tells a story of skilled artisanship, quality materials, and 
                attention to detail. We're committed to bringing you fashion that not only 
                looks beautiful but feels extraordinary.
              </p>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Learn More
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
