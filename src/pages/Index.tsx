
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
      {/* Hero Section - Modern Full Screen */}
      <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&h=1080&fit=crop&q=80" 
            alt="Fashion Collection Background" 
            className="w-full h-full object-cover opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                ✨ New Collection 2024
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-serif text-foreground leading-tight">
                Timeless
                <span className="block bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
                  Elegance
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Discover exquisite fashion pieces that blend traditional craftsmanship with modern sophistication. 
                Every thread tells a story of elegance.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full w-full sm:w-auto group">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg rounded-full border-2 w-full sm:w-auto hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                Watch Lookbook
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b8b8f5d3?w=40&h=40&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-background" alt="Customer" />
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-background" alt="Customer" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-background" alt="Customer" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">1000+ Happy Customers</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-1 text-muted-foreground">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Categories Section - Modern Grid Layout */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              Collections
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold font-serif mb-6 text-foreground">
              Shop by Style
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore our carefully curated collections, each designed to celebrate your unique style and personality
            </p>
          </div>
          
          {/* Modern Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <Link key={category.id} to={`/shop?category=${category.slug}`} className="group">
                <div className={`relative overflow-hidden rounded-2xl ${
                  index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                } ${index === 1 ? 'lg:row-span-2' : ''}`}>
                  <div className={`relative overflow-hidden ${
                    index === 1 ? 'h-80 lg:h-full' : 'h-64 lg:h-80'
                  }`}>
                    <img 
                      src={getCategoryImage(category.slug)} 
                      alt={category.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-500" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                      <div className="transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                        <h3 className="text-white text-xl lg:text-2xl xl:text-3xl font-bold font-serif capitalize mb-2">
                          {category.name}
                        </h3>
                        <p className="text-white/90 text-sm lg:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Discover our latest {category.name.toLowerCase()} collection
                        </p>
                        <div className="flex items-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                          <span className="text-white text-sm font-medium">Shop Now</span>
                          <ArrowRight className="ml-2 h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative Element */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Luxury Product Showcase */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              Bestsellers
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold font-serif mb-6 text-foreground">
              Trending Now
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Handpicked favorites loved by our community. Each piece represents our commitment to exceptional quality and timeless design.
            </p>
          </div>
          
          {/* Premium Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.map(product => {
              const discount = calculateDiscount(product.price, product.original_price);
              return (
                <div key={product.id} className="group">
                  <div className="relative">
                    {/* Product Card */}
                    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-card/80 backdrop-blur-sm">
                      <Link to={`/product/${product.id}`}>
                        <div className="relative overflow-hidden">
                          <div className="aspect-[3/4] relative">
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                            />
                            
                            {/* Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Quick View Button */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <Button className="bg-white text-foreground hover:bg-white/90 rounded-full px-6 py-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                Quick View
                              </Button>
                            </div>
                          </div>
                          
                          {/* Discount Badge */}
                          {discount > 0 && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full">
                                -{discount}%
                              </Badge>
                            </div>
                          )}
                          
                          {/* Wishlist Button */}
                          <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
                            <svg className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </Link>
                      
                      {/* Product Info */}
                      <CardContent className="p-4 lg:p-6">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors text-sm lg:text-base line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                        </Link>
                        
                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-2 text-xs text-muted-foreground">(24)</span>
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-base lg:text-lg font-bold text-primary">
                              PKR {product.price.toLocaleString()}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                PKR {product.original_price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* View All Products */}
          <div className="text-center mt-12 lg:mt-16">
            <Link to="/shop">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group">
                Explore Full Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story Section - Luxury About */}
      <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="space-y-8 order-2 lg:order-1">
              <div>
                <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  Our Story
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold font-serif mb-6 text-foreground leading-tight">
                  Crafting Dreams Into
                  <span className="block bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
                    Timeless Fashion
                  </span>
                </h2>
              </div>
              
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  At A&Z Fabrics, we believe every thread has a story. Our journey began with a vision to blend 
                  traditional craftsmanship with contemporary elegance, creating pieces that celebrate the 
                  modern woman's spirit.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Each garment is meticulously crafted by skilled artisans who pour their passion into every 
                  stitch. We source the finest materials and employ techniques passed down through generations, 
                  ensuring each piece is not just clothing, but wearable art.
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-8">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary mb-2">1000+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">Unique Designs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary mb-2">5★</div>
                  <div className="text-sm text-muted-foreground">Customer Rating</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full w-full sm:w-auto">
                    Our Story
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8 py-4 rounded-full border-2 w-full sm:w-auto hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  Visit Atelier
                </Button>
              </div>
            </div>
            
            {/* Images */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative">
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop&q=80" 
                    alt="A&Z Fabrics Craftsmanship" 
                    className="w-full h-[500px] lg:h-[600px] object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-card border shadow-xl rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Quality Assured</p>
                      <p className="text-sm text-muted-foreground">Premium Materials</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 -left-8 w-16 h-16 bg-rose-200/30 rounded-full blur-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
