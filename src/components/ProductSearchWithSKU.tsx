
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image_url: string;
  slug: string;
}

interface ProductSearchProps {
  onSearchResults: (products: Product[]) => void;
  placeholder?: string;
  className?: string;
}

const ProductSearchWithSKU = ({ onSearchResults, placeholder = "Search products by name or SKU...", className }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        onSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const performSearch = async (term: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, image_url, slug')
        .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
        .limit(20);

      if (error) throw error;

      onSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={className}
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
        </div>
      )}
    </div>
  );
};

export default ProductSearchWithSKU;
