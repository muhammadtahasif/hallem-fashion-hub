
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

interface SubcategoryFilterProps {
  selectedCategoryId?: string;
  selectedSubcategoryId?: string;
  onSubcategorySelect: (subcategoryId: string | null) => void;
  className?: string;
}

const SubcategoryFilter = ({ 
  selectedCategoryId, 
  selectedSubcategoryId, 
  onSubcategorySelect, 
  className 
}: SubcategoryFilterProps) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchSubcategories(selectedCategoryId);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);

  const fetchSubcategories = async (categoryId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('id, name, slug, category_id')
        .eq('category_id', categoryId)
        .order('name');

      if (error) throw error;

      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCategoryId || subcategories.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="font-medium mb-3">Subcategories</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedSubcategoryId === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSubcategorySelect(null)}
          className="text-xs"
        >
          All
        </Button>
        {subcategories.map((subcategory) => (
          <Button
            key={subcategory.id}
            variant={selectedSubcategoryId === subcategory.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSubcategorySelect(subcategory.id)}
            className="text-xs"
          >
            {subcategory.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryFilter;
