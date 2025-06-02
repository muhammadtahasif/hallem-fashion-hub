
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface SubcategoryFilterProfessionalProps {
  selectedSubcategories: string[];
  onSubcategoryChange: (subcategoryIds: string[]) => void;
  selectedCategory?: string;
}

const SubcategoryFilterProfessional = ({
  selectedSubcategories,
  onSubcategoryChange,
  selectedCategory
}: SubcategoryFilterProfessionalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchCategoriesWithSubcategories();
  }, []);

  const fetchCategoriesWithSubcategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');

      if (subcategoriesError) throw subcategoriesError;

      const categoriesWithSubcategories = categoriesData.map(category => ({
        ...category,
        subcategories: subcategoriesData.filter(sub => sub.category_id === category.id)
      }));

      setCategories(categoriesWithSubcategories);

      // Auto-expand selected category
      if (selectedCategory) {
        setExpandedCategories(new Set([selectedCategory]));
      }
    } catch (error) {
      console.error('Error fetching categories and subcategories:', error);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSubcategoryToggle = (subcategoryId: string) => {
    const newSelected = selectedSubcategories.includes(subcategoryId)
      ? selectedSubcategories.filter(id => id !== subcategoryId)
      : [...selectedSubcategories, subcategoryId];
    
    onSubcategoryChange(newSelected);
  };

  const clearAllFilters = () => {
    onSubcategoryChange([]);
  };

  const getSelectedSubcategoryNames = () => {
    const names: string[] = [];
    categories.forEach(category => {
      category.subcategories.forEach(sub => {
        if (selectedSubcategories.includes(sub.id)) {
          names.push(sub.name);
        }
      });
    });
    return names;
  };

  const filteredCategories = selectedCategory 
    ? categories.filter(cat => cat.id === selectedCategory)
    : categories;

  return (
    <div className="mb-6">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Filter by Category</span>
            {selectedSubcategories.length > 0 && (
              <Badge variant="secondary">{selectedSubcategories.length}</Badge>
            )}
          </div>
          {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Filter by Categories</h3>
              {selectedSubcategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Selected Filters Display */}
            {selectedSubcategories.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Selected filters:</p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedSubcategoryNames().map((name, index) => (
                    <Badge key={index} variant="secondary" className="bg-rose-100 text-rose-800">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Categories and Subcategories */}
            <div className="space-y-3">
              {filteredCategories.map((category) => (
                <div key={category.id} className="border rounded-lg">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      {category.subcategories.filter(sub => selectedSubcategories.includes(sub.id)).length > 0 && (
                        <Badge variant="secondary" className="bg-rose-100 text-rose-800">
                          {category.subcategories.filter(sub => selectedSubcategories.includes(sub.id)).length}
                        </Badge>
                      )}
                      {expandedCategories.has(category.id) ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </div>
                  </button>
                  
                  {expandedCategories.has(category.id) && (
                    <div className="px-3 pb-3 border-t bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-3">
                        {category.subcategories.map((subcategory) => (
                          <label
                            key={subcategory.id}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubcategories.includes(subcategory.id)}
                              onChange={() => handleSubcategoryToggle(subcategory.id)}
                              className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                            />
                            <span className="text-sm">{subcategory.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubcategoryFilterProfessional;
