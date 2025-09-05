
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Bold, Italic, Underline } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface ProductVariant {
  color: string;
  size: string;
  price: number;
  stock: number;
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
  const [images, setImages] = useState<string[]>(['']);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { color: '', size: '', price: 0, stock: 0 }
  ]);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    stock: 0,
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
      featured: false,
      category_id: "",
      subcategory_id: "",
    });
    setImages(['']);
    setVariants([{ color: '', size: '', price: 0, stock: 0 }]);
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

  const addImageField = () => {
    setImages([...images, '']);
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
    }
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addVariant = () => {
    setVariants([...variants, { color: '', size: '', price: 0, stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const formatText = (format: string) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      let formattedText = '';
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
        default:
          formattedText = selectedText;
      }
      
      const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      setFormData(prev => ({ ...prev, description: newValue }));
      
      // Restore focus and selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      formatText('bold');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate variants
      const validVariants = variants.filter(v => v.color.trim() && v.size.trim());
      if (validVariants.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one variant with color and size.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const slug = generateSlug(formData.name);
      const sku = generateSKU(formData.name);
      const validImages = images.filter(img => img.trim() !== '');
      
      // Create product first
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          description: formData.description,
          price: Math.min(...validVariants.map(v => v.price)), // Base price is the minimum variant price
          original_price: formData.original_price || null,
          stock: validVariants.reduce((sum, v) => sum + v.stock, 0), // Total stock
          image_url: validImages[0] || '',
          images: validImages.length > 1 ? validImages : null,
          featured: formData.featured,
          category_id: formData.category_id || null,
          subcategory_id: formData.subcategory_id || null,
          slug: slug,
          sku: sku,
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Create variants
      const variantInserts = validVariants.map((variant, index) => ({
        product_id: productData.id,
        color: variant.color,
        size: variant.size,
        price: variant.price,
        stock: variant.stock,
        sku: `${sku}-${variant.color.toUpperCase()}-${variant.size}`
      }));

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantInserts);

      if (variantError) throw variantError;

      toast({
        title: "Product added",
        description: "New product with variants has been added successfully.",
        variant: "default"
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="border rounded-md">
              <div className="flex gap-2 p-2 border-b bg-gray-50">
                <Button type="button" size="sm" variant="outline" onClick={() => formatText('bold')}>
                  <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => formatText('italic')}>
                  <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => formatText('underline')}>
                  <Underline className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-500 self-center">Tip: Select text and press Ctrl+B for bold</span>
              </div>
              <Textarea
                ref={descriptionRef}
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                rows={4}
                className="border-0 focus:ring-0"
                placeholder="Enter product description. Use **text** for bold, *text* for italic, __text__ for underline"
              />
            </div>
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Product Images
              </label>
              <Button type="button" size="sm" variant="outline" onClick={addImageField}>
                <Plus className="h-4 w-4 mr-1" />
                Add Image
              </Button>
            </div>
            <div className="space-y-2">
              {images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    placeholder={`Image URL ${index + 1}`}
                  />
                  {images.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeImageField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Variants */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium">
                Product Variants (Color, Size, Price, Stock)
              </label>
              <Button type="button" size="sm" variant="outline" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-1" />
                Add Variant
              </Button>
            </div>
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-2 lg:grid-cols-5 gap-2 p-3 border rounded">
                  <Input
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    placeholder="Color"
                  />
                  <Select
                    value={variant.size}
                    onValueChange={(value) => updateVariant(index, 'size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="Price (PKR)"
                    min="0"
                    step="0.01"
                  />
                  <Input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                    placeholder="Stock"
                    min="0"
                  />
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeVariant(index)}
                      className="lg:w-auto w-full col-span-2 lg:col-span-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
