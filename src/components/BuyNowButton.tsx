
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface BuyNowButtonProps {
  productId: string;
  className?: string;
}

const BuyNowButton = ({ productId, className }: BuyNowButtonProps) => {
  const { items, addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBuyNow = async () => {
    // Check if product is already in cart
    const existingItem = items.find(item => item.product_id === productId);
    
    if (!existingItem) {
      // Add to cart only if not already present
      await addToCart(productId, 1);
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
      className={className || "w-full bg-rose-500 hover:bg-rose-600 text-white"}
    >
      Buy Now
    </Button>
  );
};

export default BuyNowButton;
