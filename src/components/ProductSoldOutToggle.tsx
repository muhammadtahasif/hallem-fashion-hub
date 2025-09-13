import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductSoldOutToggleProps {
  productId: string;
  isSoldOut: boolean;
  onSoldOutChange: (soldOut: boolean) => void;
}

const ProductSoldOutToggle = ({ 
  productId, 
  isSoldOut, 
  onSoldOutChange 
}: ProductSoldOutToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ sold_out: checked })
        .eq('id', productId);

      if (error) throw error;

      onSoldOutChange(checked);
      toast({
        title: "Product Updated",
        description: `Product is now ${checked ? 'sold out' : 'available'}.`,
      });
    } catch (error) {
      console.error('Error updating product sold out status:', error);
      toast({
        title: "Error",
        description: "Failed to update product sold out status.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`sold-out-${productId}`}
        checked={isSoldOut}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
      <Label htmlFor={`sold-out-${productId}`} className="text-sm">
        {isSoldOut ? 'Sold Out' : 'Available'}
      </Label>
    </div>
  );
};

export default ProductSoldOutToggle;