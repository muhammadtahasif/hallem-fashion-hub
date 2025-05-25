
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  image_url: string;
  featured: boolean;
}

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ProductEditModal = ({ product, isOpen, onClose, onUpdate }: ProductEditModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    stock: 0,
    image_url: "",
    featured: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        original_price: product.original_price || 0,
        stock: product.stock,
        image_url: product.image_url || "",
        featured: product.featured,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          original_price: formData.original_price || null,
          stock: formData.stock,
          image_url: formData.image_url,
          featured: formData.featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Product updated",
        description: "Product details have been updated successfully.",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Product Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Price (PKR)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="original_price" className="block text-sm font-medium mb-2">
                Original Price (PKR)
              </label>
              <Input
                id="original_price"
                name="original_price"
                type="number"
                value={formData.original_price}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium mb-2">
              Stock Quantity
            </label>
            <Input
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="image_url" className="block text-sm font-medium mb-2">
              Image URL
            </label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="rounded"
            />
            <label htmlFor="featured" className="text-sm font-medium">
              Featured Product
            </label>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-rose-500 hover:bg-rose-600"
            >
              {isLoading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditModal;
