
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useShipping } from "@/hooks/useShipping";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Shield } from "lucide-react";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import PaymentCredentialsForm, { PaymentCredentials } from "@/components/PaymentCredentialsForm";

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { shippingCharges } = useShipping();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | null>(null);
  const [customerDetailsSubmitted, setCustomerDetailsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    address: "",
    country: "Pakistan",
    province: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('user_checkout_info')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setUserInfo(data);
        setFormData({
          name: data.name || "",
          email: user?.email || "",
          phone: data.phone || "",
          address: data.address || "",
          country: "Pakistan",
          province: "",
          city: data.city || "",
          postalCode: "",
        });
      }
    } catch (error) {
      console.log('No existing user info found, will collect during checkout');
    }
  };

  const saveUserInfo = async () => {
    if (!user) return;

    try {
      const userInfoData = {
        user_id: user.id,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
      };

      if (userInfo) {
        await supabase
          .from('user_checkout_info')
          .update(userInfoData)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_checkout_info')
          .insert([userInfoData]);
      }
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  };

  const subtotal = getTotalPrice();
  const finalTotal = subtotal + shippingCharges;

  const handlePaymentMethodSelect = (method: 'cod' | 'online') => {
    setPaymentMethod(method);
  };

  const handleCustomerDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.address || 
        !formData.country || !formData.province || !formData.city || !formData.postalCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setCustomerDetailsSubmitted(true);
    toast({
      title: "Details Saved",
      description: "Now please select a payment method to proceed.",
    });
  };

  const handlePaymentCredentialsSubmit = async (credentials: PaymentCredentials) => {
    console.log('Payment credentials collected:', credentials);
    await processOrder(credentials);
  };

  const processOrder = async (paymentCredentials?: PaymentCredentials) => {
    setIsLoading(true);

    try {
      // Save user info for future checkouts
      await saveUserInfo();

      // Generate order number
      const orderNumber = `HFH-${Date.now()}`;

      // Complete customer address
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.province}, ${formData.country} - ${formData.postalCode}`;

      if (paymentMethod === 'cod') {
        // For COD, create order immediately
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([{
            order_number: orderNumber,
            user_id: user?.id || null,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_address: fullAddress,
            total_amount: finalTotal,
            status: 'pending',
            payment_method: paymentMethod,
            payment_status: 'pending'
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: orderData.id,
          product_id: item.product_id,
          product_name: item.product?.name || 'Unknown Product',
          product_price: item.product?.price || 0,
          quantity: item.quantity
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Clear cart and redirect to success page
        await clearCart();
        navigate(`/checkout/success?order_id=${orderData.id}`);
      } else {
        // For online payment, create SAFEPAY payment session first
        const paymentData = {
          orderId: orderNumber,
          amount: finalTotal,
          currency: 'PKR',
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          description: `Order ${orderNumber} - ${items.length} items`,
          paymentCredentials: paymentCredentials
        };

        console.log('Creating SAFEPAY payment with data:', paymentData);

        const { data: safepayResponse, error: paymentError } = await supabase.functions.invoke('create-safepay-payment', {
          body: paymentData
        });

        console.log('SAFEPAY Response:', safepayResponse);

        if (paymentError) {
          console.error('Payment error:', paymentError);
          throw new Error(`Payment session failed: ${paymentError.message}`);
        }

        if (safepayResponse?.success && safepayResponse?.checkout_url) {
          // Create order in pending status (will be updated after payment)
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
              order_number: orderNumber,
              user_id: user?.id || null,
              customer_name: formData.name,
              customer_email: formData.email,
              customer_phone: formData.phone,
              customer_address: fullAddress,
              total_amount: finalTotal,
              status: 'payment_pending',
              payment_method: paymentMethod,
              payment_status: 'pending'
            }])
            .select()
            .single();

          if (orderError) throw orderError;

          // Create order items
          const orderItems = items.map(item => ({
            order_id: orderData.id,
            product_id: item.product_id,
            product_name: item.product?.name || 'Unknown Product',
            product_price: item.product?.price || 0,
            quantity: item.quantity
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) throw itemsError;

          // Clear cart before redirecting to payment
          await clearCart();
          
          // Redirect to SAFEPAY checkout
          window.location.href = safepayResponse.checkout_url;
        } else {
          throw new Error(safepayResponse?.error || 'Failed to create payment session');
        }
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/shop')} className="bg-rose-500 hover:bg-rose-600">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold font-serif mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Customer Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details (Required)</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCustomerDetailsSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      disabled={customerDetailsSubmitted}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                      disabled={customerDetailsSubmitted}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+92 300 1234567"
                      disabled={customerDetailsSubmitted}
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-2">
                      Street Address *
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="House/flat number, street name"
                      disabled={customerDetailsSubmitted}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium mb-2">
                        Country *
                      </label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder="Country"
                        disabled={customerDetailsSubmitted}
                      />
                    </div>
                    <div>
                      <label htmlFor="province" className="block text-sm font-medium mb-2">
                        Province *
                      </label>
                      <Input
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        required
                        placeholder="Province/State"
                        disabled={customerDetailsSubmitted}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-2">
                        City *
                      </label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Your city"
                        disabled={customerDetailsSubmitted}
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium mb-2">
                        Postal Code *
                      </label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                        placeholder="Postal/ZIP code"
                        disabled={customerDetailsSubmitted}
                      />
                    </div>
                  </div>

                  {!customerDetailsSubmitted && (
                    <Button
                      type="submit"
                      className="w-full bg-rose-500 hover:bg-rose-600"
                      size="lg"
                    >
                      Save Details & Continue
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Payment Method Selection - Only shown after customer details */}
            {customerDetailsSubmitted && (
              <>
                <PaymentMethodSelector 
                  onSelectMethod={handlePaymentMethodSelect}
                  selectedMethod={paymentMethod}
                />

                {/* Payment Credentials Form - Only for online payments */}
                {paymentMethod === 'online' && (
                  <PaymentCredentialsForm 
                    onSubmit={handlePaymentCredentialsSubmit}
                    isLoading={isLoading}
                  />
                )}

                {/* COD Confirmation */}
                {paymentMethod === 'cod' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Confirm Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                        <p className="text-yellow-800 font-medium">Cash on Delivery Selected</p>
                        <p className="text-sm text-yellow-700">
                          You will pay PKR {finalTotal.toLocaleString()} when your order is delivered.
                        </p>
                      </div>
                      <Button
                        onClick={() => processOrder()}
                        disabled={isLoading}
                        className="w-full bg-rose-500 hover:bg-rose-600"
                        size="lg"
                      >
                        {isLoading ? "Processing..." : `Confirm Order - PKR ${finalTotal.toLocaleString()}`}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                    <Link to={`/product/${item.product_id}`}>
                      <img
                        src={item.product?.image_url}
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/product/${item.product_id}`}>
                        <h4 className="font-medium hover:text-rose-500 transition-colors cursor-pointer">
                          {item.product?.name}
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      PKR {((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCharges === 0 ? 'Free' : `PKR ${shippingCharges.toLocaleString()}`}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-rose-500">PKR {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
