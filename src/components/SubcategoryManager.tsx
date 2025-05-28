
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Edit, Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  category_id: string;
  categories?: {
    name: string;
  };
}

const SubcategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    category_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Fetch subcategories with category names
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('name');

      if (subcategoriesError) throw subcategoriesError;

      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data.",
        variant: "destructive"
      });
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category_id) {
      toast({
        title: "Error",
        description: "Subcategory name and category are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing subcategory
        const { error } = await supabase
          .from('subcategories')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            image_url: formData.image_url || null,
            category_id: formData.category_id
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Subcategory updated successfully."
        });
      } else {
        // Create new subcategory
        const { error } = await supabase
          .from('subcategories')
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            image_url: formData.image_url || null,
            category_id: formData.category_id
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Subcategory created successfully."
        });
      }

      // Reset form
      setFormData({ name: '', slug: '', description: '', image_url: '', category_id: '' });
      setIsAdding(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to save subcategory.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setFormData({
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || '',
      image_url: subcategory.image_url || '',
      category_id: subcategory.category_id
    });
    setEditingId(subcategory.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subcategory deleted successfully."
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to delete subcategory.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', slug: '', description: '', image_url: '', category_id: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Subcategory Management</h3>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-rose-500 hover:bg-rose-600"
          disabled={isAdding}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subcategory
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Subcategory' : 'Add New Subcategory'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Parent Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
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
              <div>
                <Label htmlFor="name">Subcategory Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter subcategory name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="subcategory-slug"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Subcategory description"
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
                  {editingId ? 'Update' : 'Create'} Subcategory
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Subcategories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subcategories.length === 0 ? (
              <p className="text-gray-500">No subcategories found.</p>
            ) : (
              subcategories.map((subcategory) => (
                <div key={subcategory.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium capitalize">{subcategory.name}</h4>
                    <p className="text-sm text-gray-500">Category: {subcategory.categories?.name}</p>
                    <p className="text-sm text-gray-500">Slug: {subcategory.slug}</p>
                    {subcategory.description && (
                      <p className="text-sm text-gray-600 mt-1">{subcategory.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(subcategory)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(subcategory.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubcategoryManager;
