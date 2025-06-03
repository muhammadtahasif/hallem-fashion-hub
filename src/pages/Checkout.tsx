import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useShipping } from "@/hooks/useShipping";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Package, CreditCard, ShieldCheck, MapPin, Phone, Mail } from "lucide-react";

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

interface PaymentCredentials {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { shippingCharges } = useShipping();
  const { toast } = useToast();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [paymentCredentials, setPaymentCredentials] = useState<PaymentCredentials>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setCustomerInfo(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address || !customerInfo.city || !customerInfo.country || !customerInfo.province || !customerInfo.postalCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer details.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'online' && (!paymentCredentials.cardNumber || !paymentCredentials.expiryMonth || !paymentCredentials.expiryYear || !paymentCredentials.cvv)) {
      toast({
        title: "Payment Details Required",
        description: "Please fill in all payment details.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderNumber = `ORD-${Date.now()}`;
      const totalWithShipping = total + shippingCharges;

      if (paymentMethod === 'online') {
        // Create SAFEPAY payment session
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-safepay-payment', {
          body: {
            orderId: orderNumber,
            amount: totalWithShipping,
            currency: 'PKR',
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            description: `Order ${orderNumber}`,
            paymentCredentials
          }
        });

        if (paymentError || !paymentData?.success) {
          throw new Error(paymentData?.error || 'Failed to create payment session');
        }

        // Redirect to SAFEPAY for payment
        window.location.href = paymentData.checkout_url;
        return;
      } else {
        // COD - create order directly
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
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
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          product_price: item.product.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Clear cart and redirect to thank you page
        clearCart();
        navigate(`/order-placed?order_number=${orderNumber}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "An error occurred during checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <Package className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input
                    type="text"
                    id="province"
                    name="province"
                    value={customerInfo.province}
                    onChange={handleInputChange}
                    placeholder="Enter your province"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    type="text"
                    id="country"
                    name="country"
                    value={customerInfo.country}
                    onChange={handleInputChange}
                    placeholder="Enter your country"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={customerInfo.postalCode}
                    onChange={handleInputChange}
                    placeholder="Enter your postal code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <ShieldCheck className="w-5 h-5" />
                Order Summary
              </h3>
              <div className="border rounded-md p-4">
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item.product.id} className="flex justify-between items-center">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>PKR {(item.product.price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-semibold mt-4">
                  <span>Subtotal</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold mt-2">
                  <span>Shipping</span>
                  <span>PKR {shippingCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Total</span>
                  <span>PKR {(total + shippingCharges).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h3>
              <RadioGroup defaultValue="cod" className="flex flex-col space-y-2" onValueChange={value => setPaymentMethod(value === 'cod' ? 'cod' : 'online')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                  <Label
                    htmlFor="cod"
                    className={cn(
                      "cursor-pointer rounded-md border p-4 font-normal shadow-sm transition-colors peer-checked:bg-accent peer-checked:text-accent-foreground peer-checked:ring-1 peer-checked:ring-ring disabled:cursor-not-allowed peer-required:text-red-500",
                      paymentMethod === 'cod' ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    Cash on Delivery
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" className="peer sr-only" />
                  <Label
                    htmlFor="online"
                    className={cn(
                      "cursor-pointer rounded-md border p-4 font-normal shadow-sm transition-colors peer-checked:bg-accent peer-checked:text-accent-foreground peer-checked:ring-1 peer-checked:ring-ring disabled:cursor-not-allowed peer-required:text-red-500",
                      paymentMethod === 'online' ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    Online Payment
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Details (Conditional) */}
            {paymentMethod === 'online' && (
              <div>
                <h3 className="text-md font-semibold mb-2">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="Enter your card number"
                      onChange={handlePaymentChange}
                      required={paymentMethod === 'online'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryMonth">Expiry Month</Label>
                    <Select onValueChange={(value) => setPaymentCredentials(prev => ({ ...prev, expiryMonth: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expiryYear">Expiry Year</Label>
                    <Select onValueChange={(value) => setPaymentCredentials(prev => ({ ...prev, expiryYear: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="Enter CVV"
                      onChange={handlePaymentChange}
                      required={paymentMethod === 'online'}
                    />
                  </div>
                </div>
              </div>
            )}

            <Button disabled={isProcessing} className="w-full bg-rose-500 hover:bg-rose-600">
              {isProcessing ? (
                <>
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;
