
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, MapPin, Phone, Mail, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    product_price: number;
  }>;
}

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phoneNumber.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both order number and phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setNotFound(false);
    setOrder(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            product_price
          )
        `)
        .eq('order_number', orderNumber.trim())
        .eq('customer_phone', phoneNumber.trim())
        .single();

      if (error || !data) {
        setNotFound(true);
        toast({
          title: "Order not found",
          description: "Please check your order number and phone number.",
          variant: "destructive",
        });
      } else {
        setOrder(data);
        toast({
          title: "Order found",
          description: "Your order details are displayed below.",
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setNotFound(true);
      toast({
        title: "Error",
        description: "Failed to fetch order details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Your order has been received and is being processed.';
      case 'processing':
        return 'Your order is being prepared for shipment.';
      case 'shipped':
        return 'Your order has been shipped and is on its way to you.';
      case 'delivered':
        return 'Your order has been delivered successfully.';
      case 'cancelled':
        return 'Your order has been cancelled.';
      default:
        return 'Order status unknown.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold font-serif text-center mb-8">Track Your Order</h1>

          {/* Information Card */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">How to find your Order ID:</p>
                  <p>Go to <strong>Account</strong> → <strong>My Orders</strong> to find your order number.</p>
                  <p className="mt-2">Enter both your order number and the phone number used during checkout to track your order.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enter Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium mb-2">
                    Order Number *
                  </label>
                  <Input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g., AZ-1234567890"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., +92 300 1234567"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the same phone number used during checkout
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-500 hover:bg-rose-600"
                >
                  {loading ? "Searching..." : "Track Order"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {order && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Details</span>
                  <Badge className={`${getStatusColor(order.status)} text-white capitalize`}>
                    {order.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">{order.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{order.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-rose-500">
                        PKR {order.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">{getStatusMessage(order.status)}</p>
                  </div>
                </div>

                <Separator />

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium ml-2">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{order.customer_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{order.customer_phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <p className="mt-1 text-sm">{order.customer_address}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-gray-600 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="font-medium">
                          PKR {(item.product_price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {notFound && (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find an order with the provided details.
                </p>
                <p className="text-sm text-gray-500">
                  Please check your order number and phone number, or contact us for assistance.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
