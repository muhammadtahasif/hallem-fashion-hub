
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrderTracking = () => {
  const [trackingInfo, setTrackingInfo] = useState({
    orderId: "",
    phone: ""
  });
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock order data - will be replaced with real data from Google Sheets/Supabase
  const mockOrder = {
    id: "ALH-2024-001",
    customerName: "Fatima Khan",
    phone: "+92 300 1234567",
    address: "House 123, Street 5, Gulberg, Lahore",
    product: "Royal Blue Embroidered Dupatta",
    quantity: 1,
    amount: 2500,
    orderDate: "2024-01-15",
    status: "shipped",
    trackingSteps: [
      { step: "Order Placed", date: "2024-01-15", time: "10:30 AM", completed: true },
      { step: "Order Confirmed", date: "2024-01-15", time: "02:15 PM", completed: true },
      { step: "Processing", date: "2024-01-16", time: "11:00 AM", completed: true },
      { step: "Shipped", date: "2024-01-17", time: "09:45 AM", completed: true },
      { step: "Out for Delivery", date: "", time: "", completed: false },
      { step: "Delivered", date: "", time: "", completed: false }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call to Google Sheets/Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (trackingInfo.orderId.toLowerCase().includes('alh') || trackingInfo.phone.includes('300')) {
      setOrderDetails(mockOrder);
      toast({
        title: "Order found!",
        description: "Your order details are displayed below.",
      });
    } else {
      toast({
        title: "Order not found",
        description: "Please check your Order ID or phone number and try again.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingInfo({
      ...trackingInfo,
      [e.target.name]: e.target.value
    });
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
            Enter your order ID or phone number to check the status of your order
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
                  <label htmlFor="orderId" className="block text-sm font-medium mb-2">
                    Order ID (Optional)
                  </label>
                  <Input
                    id="orderId"
                    name="orderId"
                    value={trackingInfo.orderId}
                    onChange={handleChange}
                    placeholder="e.g., ALH-2024-001"
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
                    value={trackingInfo.phone}
                    onChange={handleChange}
                    required
                    placeholder="e.g., +92 300 1234567"
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
                  <h4 className="font-semibold mb-2">Product</h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{orderDetails.product}</p>
                      <p className="text-sm text-gray-600">Quantity: {orderDetails.quantity}</p>
                    </div>
                    <p className="font-semibold">PKR {orderDetails.amount.toLocaleString()}</p>
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
