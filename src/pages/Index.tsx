
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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
  image_url?: string;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured products
      const { data: products, error: productsError } = await supabase
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
        .limit(8);

      if (productsError) throw productsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .limit(6);

      if (categoriesError) throw categoriesError;

      setFeaturedProducts(products || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImage = (categorySlug: string) => {
    const imageMap: { [key: string]: string } = {
      'dupattas': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop',
      'hijabs': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      'ready-made': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop',
      'unstitched': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop'
    };
    return imageMap[categorySlug] || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop';
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-rose-100 to-pink-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-gray-800 mb-6">
            Welcome to AL - HALLEM
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover our exquisite collection of premium women's fashion. From elegant dupattas to stylish ready-made outfits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center font-serif mb-12">Shop by Categories</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link key={category.id} to={`/shop?category=${category.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={category.image_url || getCategoryImage(category.slug)}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-white text-xl font-semibold capitalize">{category.name}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center font-serif mb-12">Featured Products</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
              <Link to="/shop">
                <Button className="mt-4 bg-rose-500 hover:bg-rose-600">
                  Browse All Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
                const discount = calculateDiscount(product.price, product.original_price);
                return (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                    <Link to={`/product/${product.id}`}>
                      <div className="relative">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
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
                      <div className="flex items-center justify-between">
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
                      <p className="text-xs text-gray-500 mt-2 capitalize">
                        {product.categories?.name}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-rose-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-serif mb-4">Ready to Shop?</h2>
          <p className="text-xl mb-8 opacity-90">
            Explore our complete collection and find your perfect style
          </p>
          <Link to="/shop">
            <Button size="lg" variant="outline" className="bg-white text-rose-500 hover:bg-gray-100 border-white">
              Browse All Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
