
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useShipping } from "@/hooks/useShipping";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import CartItemCard from "@/components/CartItemCard";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { shippingCharges } = useShipping();
  const isMobile = useIsMobile();

  const subtotal = getTotalPrice();
  const total = subtotal + shippingCharges;

  if (items.length === 0) {
    return (
      <div className="min-h-screen fashion-gradient">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild className="bg-rose-500 hover:bg-rose-600">
              <Link to="/shop">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen fashion-gradient">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/shop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">Your Cart ({items.length} items)</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={{
                    id: item.id,
                    name: item.product?.name || '',
                    price: item.variant_price || item.product?.price || 0,
                    quantity: item.quantity,
                    image_url: item.product?.image_url,
                    selected_color: item.selected_color,
                    selected_size: item.selected_size
                  }}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Shipping</span>
                    <span>
                      {shippingCharges === 0 ? "Free" : `PKR ${shippingCharges.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>PKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  asChild 
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 sm:py-3"
                >
                  <Link to="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>

                <div className="text-center">
                  <Button variant="ghost" asChild className="text-sm">
                    <Link to="/shop">
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
