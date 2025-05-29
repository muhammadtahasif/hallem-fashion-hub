
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Package, Calendar, MapPin, Phone, Mail } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const trackOrder = async () => {
    if (!orderNumber.trim()) {
      toast({
        title: "Order number required",
        description: "Please enter your order number to track your order.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setOrder(null);

    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            product_price
          )
        `)
        .eq('order_number', orderNumber.trim());

      // If phone number is provided, add it to the query for additional verification
      if (phoneNumber.trim()) {
        query = query.eq('customer_phone', phoneNumber.trim());
      }

      const { data, error } = await query.single();

      if (error || !data) {
        setNotFound(true);
        toast({
          title: "Order not found",
          description: phoneNumber.trim() 
            ? "No order found with the provided order number and phone number."
            : "No order found with the provided order number.",
          variant: "destructive",
        });
        return;
      }

      setOrder(data);
      toast({
        title: "Order found",
        description: "Your order details have been loaded successfully.",
      });

    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: "Error",
        description: "Failed to track order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Your order has been received and is being prepared.';
      case 'processing': return 'Your order is currently being processed.';
      case 'shipped': return 'Your order has been shipped and is on its way.';
      case 'delivered': return 'Your order has been delivered successfully.';
      case 'cancelled': return 'Your order has been cancelled.';
      default: return 'Status unknown.';
    }
  };

  return (
    <div className="min-h-screen fashion-gradient">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-serif mb-4">Track Your Order</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your order number to track the status of your order. 
            You can also provide your phone number for additional verification.
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium mb-2">
                Order Number *
              </label>
              <Input
                id="orderNumber"
                type="text"
                placeholder="Enter your order number (e.g., ORD-001)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
                Phone Number (Optional)
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number for verification"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Providing your phone number helps verify the order belongs to you
              </p>
            </div>

            <Button
              onClick={trackOrder}
              disabled={isLoading}
              className="w-full bg-rose-500 hover:bg-rose-600"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Track Order
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{order.order_number}</CardTitle>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    Ordered on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={`${getStatusColor(order.status)} text-white capitalize text-lg px-4 py-2`}>
                    {order.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    {getStatusDescription(order.status)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Customer Details
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {order.customer_email}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.customer_phone}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{order.customer_address}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-white border rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">PKR {(item.product_price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center font-bold text-xl pt-4 border-t mt-4">
                  <span>Total Amount:</span>
                  <span className="text-rose-500">PKR {order.total_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div>
                <h3 className="font-semibold mb-4">Order Status</h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${order.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                    <div className={`w-3 h-3 rounded-full ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <span>Order Received</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${order.status === 'processing' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                    <div className={`w-3 h-3 rounded-full ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <span>Order Processing</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${order.status === 'shipped' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                    <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                    <span>Order Shipped</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${order.status === 'delivered' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Order Delivered</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Not Found Message */}
        {notFound && (
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find an order with the provided details. Please check your order number and try again.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setOrderNumber("");
                  setPhoneNumber("");
                  setNotFound(false);
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-6">
            If you're having trouble tracking your order or have any questions, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <a href="tel:+923090449955">📞 Call Us</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/contact">✉️ Contact Support</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
