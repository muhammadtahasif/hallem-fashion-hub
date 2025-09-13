
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface BuyNowButtonProps {
  productId: string;
  className?: string;
  quantity?: number;
  variantId?: string;
  selectedColor?: string;
  selectedSize?: string;
  isSoldOut?: boolean;
}

const BuyNowButton = ({ productId, className, quantity = 1, variantId, selectedColor, selectedSize, isSoldOut = false }: BuyNowButtonProps) => {
  const { items, addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBuyNow = async () => {
    // Check if product with same variant is already in cart
    const existingItem = items.find(item => 
      item.product_id === productId &&
      item.variant_id === variantId &&
      item.selected_color === selectedColor &&
      item.selected_size === selectedSize
    );
    
    if (!existingItem) {
      // Add to cart with variant info
      await addToCart(productId, quantity, variantId, selectedColor, selectedSize);
      toast({
        title: "Product added to cart",
        description: "Redirecting to checkout...",
      });
    }
    
    // Always navigate to checkout
    navigate('/checkout');
  };

  return (
    <Button 
      onClick={handleBuyNow}
      disabled={isSoldOut}
      className={
        isSoldOut 
          ? "w-full bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-50 text-white"
          : className || "w-full bg-rose-500 hover:bg-rose-600 text-white"
      }
    >
      {isSoldOut ? 'Sold Out' : 'Buy Now'}
    </Button>
  );
};

export default BuyNowButton;
