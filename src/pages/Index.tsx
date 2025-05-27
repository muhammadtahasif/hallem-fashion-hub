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
      const {
        data: products,
        error: productsError
      } = await supabase.from('products').select('*').eq('featured', true).limit(4);
      if (productsError) throw productsError;

      // Fetch categories
      const {
        data: cats,
        error: catsError
      } = await supabase.from('categories').select('*').order('name');
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
    return Math.round((originalPrice - price) / originalPrice * 100);
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-r from-rose-50 to-pink-50 flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold font-serif text-gray-900 leading-tight">
                Elegant Fashion
                <span className="text-rose-500 block">Collection</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover timeless pieces that blend tradition with contemporary style. 
                Each garment is crafted with precision and attention to detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop">
                  <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop" alt="Fashion Collection" className="rounded-lg shadow-2xl object-none" />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                </div>
                <p className="text-sm text-gray-600">1000+ Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collections designed for the modern woman
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map(category => <Link key={category.id} to={`/shop?category=${category.slug}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img src={getCategoryImage(category.slug)} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-white text-2xl font-bold font-serif capitalize">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Card>
              </Link>)}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked pieces from our latest collection
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => {
            const discount = calculateDiscount(product.price, product.original_price);
            return <div key={product.id} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <Link to={`/product/${product.id}`}>
                      <div className="relative">
                        <img src={product.image_url} alt={product.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
                        {discount > 0 && <Badge className="absolute top-2 left-2 bg-rose-500">
                            -{discount}%
                          </Badge>}
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold mb-2 group-hover:text-rose-500 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-rose-500">
                          PKR {product.price.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > product.price && <span className="text-sm text-gray-500 line-through">
                            PKR {product.original_price.toLocaleString()}
                          </span>}
                      </div>
                    </CardContent>
                  </Card>
                </div>;
          })}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/shop">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=400&fit=crop" alt="About A&Z Fabrics" className="rounded-lg shadow-lg" />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold font-serif">About A&Z Fabrics</h2>
              <p className="text-gray-600 leading-relaxed">
                At A&Z Fabrics, we believe in celebrating the beauty of traditional craftsmanship 
                while embracing modern design sensibilities. Our collection features carefully 
                curated pieces that reflect elegance, comfort, and style.
              </p>
              <p className="text-gray-600 leading-relaxed">
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
    </div>;
};
export default Index;