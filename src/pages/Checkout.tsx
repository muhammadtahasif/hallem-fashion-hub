import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useShipping } from "@/hooks/useShipping";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Package, CreditCard, ShieldCheck, MapPin, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}
const Checkout = () => {
  const navigate = useNavigate();
  const {
    items,
    total,
    clearCart
  } = useCart();
  const {
    user
  } = useAuth();
  const {
    shippingCharges
  } = useShipping();
  const {
    toast
  } = useToast();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    province: '',
    country: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    if (user?.email) {
      setCustomerInfo(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const updateProductStock = async (productId: string, quantity: number) => {
    // Get current stock
    const {
      data: product,
      error: fetchError
    } = await supabase.from('products').select('stock').eq('id', productId).single();
    if (fetchError) {
      console.error('Error fetching product stock:', fetchError);
      return false;
    }

    // Update stock
    const newStock = Math.max(0, product.stock - quantity);
    const {
      error: updateError
    } = await supabase.from('products').update({
      stock: newStock
    }).eq('id', productId);
    if (updateError) {
      console.error('Error updating product stock:', updateError);
      return false;
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate customer info
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address || !customerInfo.city || !customerInfo.country || !customerInfo.province || !customerInfo.postalCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer details.",
        variant: "destructive"
      });
      return;
    }
    if (paymentMethod === 'online') {
      toast({
        title: "Payment Not Available",
        description: "Online payment is not available right now. Please use Cash on Delivery.",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    try {
      const orderNumber = `ORD-${Date.now()}`;
      const totalWithShipping = total + shippingCharges;

      // Create order
      const {
        data: order,
        error: orderError
      } = await supabase.from('orders').insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.province}, ${customerInfo.country}, ${customerInfo.postalCode}`,
        total_amount: totalWithShipping,
        payment_method: 'cod',
        payment_status: 'pending',
        status: 'pending'
      }).select().single();
      if (orderError) throw orderError;

      // Create order items and update stock
      for (const item of items) {
        // Create order item
        const {
          error: itemsError
        } = await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          product_price: item.product.price
        });
        if (itemsError) throw itemsError;

        // Update product stock
        await updateProductStock(item.product.id, item.quantity);
      }

      // Clear cart and redirect to thank you page
      clearCart();
      navigate(`/order-placed?order_number=${orderNumber}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "An error occurred during checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return <div className="container mx-auto px-4 py-6 sm:py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl font-bold">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <Input type="text" id="name" name="name" value={customerInfo.name} onChange={handleInputChange} placeholder="Enter your full name" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <Input type="email" id="email" name="email" value={customerInfo.email} onChange={handleInputChange} placeholder="Enter your email address" required className="mt-1" />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input type="tel" id="phone" name="phone" value={customerInfo.phone} onChange={handleInputChange} placeholder="Enter your phone number" required className="mt-1" />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                Shipping Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-sm">Address</Label>
                  <Input type="text" id="address" name="address" value={customerInfo.address} onChange={handleInputChange} placeholder="Enter your street address" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm">City</Label>
                  <Input type="text" id="city" name="city" value={customerInfo.city} onChange={handleInputChange} placeholder="Enter your city" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="province" className="text-sm">Province</Label>
                  <Input type="text" id="province" name="province" value={customerInfo.province} onChange={handleInputChange} placeholder="Enter your province" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Input type="text" id="country" name="country" value={customerInfo.country} onChange={handleInputChange} placeholder="Enter your country" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-sm">Postal Code</Label>
                  <Input type="text" id="postalCode" name="postalCode" value={customerInfo.postalCode} onChange={handleInputChange} placeholder="Enter your postal code" required className="mt-1" />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                Order Summary
              </h3>
              <div className="border rounded-md p-4 space-y-3">
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {items.map(item => <div key={item.product.id} className="flex justify-between items-center text-sm">
                      <span className="flex-1 pr-2">{item.product.name} x {item.quantity}</span>
                      <span className="font-medium">PKR {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>)}
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>PKR {shippingCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>Total</span>
                    <span>PKR {(total + shippingCharges).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Payment Method
              </h3>
              <RadioGroup defaultValue="cod" onValueChange={value => setPaymentMethod(value as 'cod' | 'online')} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                  <Label htmlFor="cod" className={cn("cursor-pointer rounded-md border p-4 font-normal shadow-sm transition-colors peer-checked:bg-accent peer-checked:text-accent-foreground peer-checked:ring-1 peer-checked:ring-ring w-full text-center", paymentMethod === 'cod' ? "bg-accent text-accent-foreground" : "")}>
                    💵 Cash on Delivery
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" className="peer sr-only" />
                  <Label htmlFor="online" className={cn("cursor-pointer rounded-md border p-4 font-normal shadow-sm transition-colors peer-checked:bg-accent peer-checked:text-accent-foreground peer-checked:ring-1 peer-checked:ring-ring w-full text-center", paymentMethod === 'online' ? "bg-accent text-accent-foreground" : "")}>
                    💳 Online Payment
                    <div className="text-xs mt-1 opacity-75">Card • JazzCash • EasyPaisa • Bank</div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'online' && <Alert className="mt-4 bg-rose-100">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Online payment is not available right now. You can order by "Cash on Delivery".
                  </AlertDescription>
                </Alert>}
            </div>

            <Button disabled={isProcessing} className="w-full bg-rose-500 hover:bg-rose-600 py-3 text-base">
              {isProcessing ? <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div> : `Place Order - PKR ${(total + shippingCharges).toLocaleString()}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default Checkout;