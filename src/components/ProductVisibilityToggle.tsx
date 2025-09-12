import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductVisibilityToggleProps {
  productId: string;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

const ProductVisibilityToggle = ({ 
  productId, 
  isVisible, 
  onVisibilityChange 
}: ProductVisibilityToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_visible: checked })
        .eq('id', productId);

      if (error) throw error;

      onVisibilityChange(checked);
      toast({
        title: "Product Updated",
        description: `Product is now ${checked ? 'visible' : 'hidden'} from customers.`,
      });
    } catch (error) {
      console.error('Error updating product visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update product visibility.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`visibility-${productId}`}
        checked={isVisible}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
      <Label htmlFor={`visibility-${productId}`} className="text-sm">
        {isVisible ? 'Visible' : 'Hidden'}
      </Label>
    </div>
  );
};

export default ProductVisibilityToggle;