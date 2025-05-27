import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const OrderTracking = () => {
  const [trackingId, setTrackingId] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            product_price,
            product_id,
            products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('order_number', trackingId)
        .single();

      if (error || !data) {
        toast({
          title: "Order not found",
          description: "Please check your Order ID and try again.",
          variant: "destructive"
        });
        setOrderDetails(null);
        return;
      }

      // Transform the data
      const transformedOrder = {
        id: data.order_number,
        customerName: data.customer_name,
        phone: data.customer_phone,
        address: data.customer_address,
        items: data.order_items.map(item => ({
          id: item.product_id,
          name: item.product_name,
          quantity: item.quantity,
          price: item.product_price,
          image_url: item.products?.image_url || '',
          total: item.product_price * item.quantity
        })),
        amount: data.total_amount,
        orderDate: new Date(data.created_at).toLocaleDateString(),
        status: data.status,
        trackingSteps: [
          { step: "Order Placed", date: new Date(data.created_at).toLocaleDateString(), time: new Date(data.created_at).toLocaleTimeString(), completed: true },
          { step: "Order Confirmed", date: data.status !== 'pending' ? new Date(data.created_at).toLocaleDateString() : "", time: data.status !== 'pending' ? "02:15 PM" : "", completed: data.status !== 'pending' },
          { step: "Processing", date: ['processing', 'shipped', 'delivered'].includes(data.status) ? new Date(data.updated_at).toLocaleDateString() : "", time: ['processing', 'shipped', 'delivered'].includes(data.status) ? "11:00 AM" : "", completed: ['processing', 'shipped', 'delivered'].includes(data.status) },
          { step: "Shipped", date: ['shipped', 'delivered'].includes(data.status) ? new Date(data.updated_at).toLocaleDateString() : "", time: ['shipped', 'delivered'].includes(data.status) ? "09:45 AM" : "", completed: ['shipped', 'delivered'].includes(data.status) },
          { step: "Out for Delivery", date: data.status === 'delivered' ? new Date(data.updated_at).toLocaleDateString() : "", time: data.status === 'delivered' ? "10:30 AM" : "", completed: data.status === 'delivered' },
          { step: "Delivered", date: data.status === 'delivered' ? new Date(data.updated_at).toLocaleDateString() : "", time: data.status === 'delivered' ? "02:15 PM" : "", completed: data.status === 'delivered' }
        ]
      };

      setOrderDetails(transformedOrder);
      toast({
        title: "Order found!",
        description: "Your order details are displayed below.",
        variant: "success"
      });

    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen fashion-gradient">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-serif mb-4">Track Your Order</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your order ID to check the status of your order
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Tracking Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif">Find Your Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="trackingId" className="block text-sm font-medium mb-2">
                    Order ID *
                  </label>
                  <Input
                    id="trackingId"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    required
                    placeholder="e.g., ALH-1748251380123"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {isLoading ? "Searching..." : "Track Order"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Demo Tracking</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Order ID:</strong> ALH-2024-001</p>
                  <p><strong>Phone:</strong> +92 300 1234567</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          {orderDetails && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif">Order Details</CardTitle>
                  <Badge className={`${getStatusColor(orderDetails.status)} text-white capitalize`}>
                    {orderDetails.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Order Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Order ID:</strong> {orderDetails.id}</p>
                      <p><strong>Date:</strong> {orderDetails.orderDate}</p>
                      <p><strong>Amount:</strong> PKR {orderDetails.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Customer Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {orderDetails.customerName}</p>
                      <p><strong>Phone:</strong> {orderDetails.phone}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Product Details */}
                <div>
                  <h4 className="font-semibold mb-4">Ordered Items</h4>
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <Link to={`/product/${item.id}`} className="flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link to={`/product/${item.id}`}>
                            <h5 className="font-medium hover:text-rose-500 transition-colors cursor-pointer">
                              {item.name}
                            </h5>
                          </Link>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: PKR {item.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">PKR {item.total.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600">{orderDetails.address}</p>
                </div>

                <Separator />

                {/* Tracking Timeline */}
                <div>
                  <h4 className="font-semibold mb-4">Order Timeline</h4>
                  <div className="space-y-4">
                    {orderDetails.trackingSteps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {step.completed && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                              {step.step}
                            </p>
                            {step.date && (
                              <div className="text-sm text-gray-500">
                                {step.date} {step.time}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    Download Invoice
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
