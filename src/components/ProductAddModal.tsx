
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface ProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

const ProductAddModal = ({ isOpen, onClose, onAdd }: ProductAddModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    stock: 0,
    image_url: "",
    featured: false,
    category_id: "",
    subcategory_id: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.category_id) {
      const filtered = subcategories.filter(sub => sub.category_id === formData.category_id);
      setFilteredSubcategories(filtered);
      setFormData(prev => ({ ...prev, subcategory_id: "" }));
    }
  }, [formData.category_id, subcategories]);

  const fetchData = async () => {
    try {
      const [categoriesData, subcategoriesData] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('subcategories').select('id, name, category_id').order('name')
      ]);

      if (categoriesData.error) throw categoriesData.error;
      if (subcategoriesData.error) throw subcategoriesData.error;

      setCategories(categoriesData.data || []);
      setSubcategories(subcategoriesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      original_price: 0,
      stock: 0,
      image_url: "",
      featured: false,
      category_id: "",
      subcategory_id: "",
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const generateSKU = (name: string) => {
    const timestamp = Date.now().toString().slice(-6);
    const namePrefix = name.slice(0, 3).toUpperCase();
    return `SKU-${namePrefix}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const slug = generateSlug(formData.name);
      const sku = generateSKU(formData.name);
      
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          description: formData.description,
          price: formData.price,
          original_price: formData.original_price || null,
          stock: formData.stock,
          image_url: formData.image_url,
          featured: formData.featured,
          category_id: formData.category_id || null,
          subcategory_id: formData.subcategory_id || null,
          slug: slug,
          sku: sku,
        }]);

      if (error) throw error;

      toast({
        title: "Product added",
        description: "New product has been added successfully.",
        variant: "success"
      });

      onAdd();
      onClose();
    } catch (error: any) {
      toast({
        title: "Add failed",
        description: error.message || "Failed to add product.",
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
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

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.category_id && (
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium mb-2">
                Subcategory
              </label>
              <Select value={formData.subcategory_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              {isLoading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAddModal;
