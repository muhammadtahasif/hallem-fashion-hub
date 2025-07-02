import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Package, AlertCircle, CheckCircle } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  product_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items: OrderItem[];
}

const Returns = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);
  const { toast } = useToast();

  const searchOrder = async () => {
    if (!orderNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your order number.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            product_price
          )
        `)
        .eq('order_number', orderNumber.trim())
        .single();

      if (error) {
        toast({
          title: "Order not found",
          description: "Please check your order number and try again.",
          variant: "destructive"
        });
        setOrder(null);
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReturn = async () => {
    if (!order) return;
    
    if (!returnReason.trim()) {
      toast({
        title: "Error", 
        description: "Please provide a reason for the return.",
        variant: "destructive"
      });
      return;
    }

    setReturning(true);
    try {
      // Create return record
      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .insert({
          order_id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          total_amount: order.total_amount,
          reason: returnReason,
          status: 'pending'
        })
        .select()
        .single();

      if (returnError) throw returnError;

      // Create return items
      const returnItems = order.order_items.map(item => ({
        return_id: returnData.id,
        product_name: item.product_name,
        quantity: item.quantity,
        product_price: item.product_price
      }));

      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);

      if (itemsError) throw itemsError;

      setReturnSubmitted(true);
      toast({
        title: "Return request submitted",
        description: "Your return request has been submitted successfully. We'll contact you soon.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error submitting return:', error);
      toast({
        title: "Error",
        description: "Failed to submit return request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setReturning(false);
    }
  };

  const canReturnOrder = order && order.status === 'delivered';

  if (returnSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-900">Return Request Submitted</h1>
            <p className="text-gray-600">
              Your return request for order #{order?.order_number} has been submitted successfully.
              Our team will review your request and contact you within 24-48 hours.
            </p>
            <Button onClick={() => {
              setReturnSubmitted(false);
              setOrder(null);
              setOrderNumber("");
              setReturnReason("");
            }}>
              Submit Another Return
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Return Your Order</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your order number to view order details and initiate a return request.
            Only delivered orders can be returned.
          </p>
        </div>

        {/* Guide Section */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Where to find your Order Number?</h3>
                <p className="text-blue-700 text-sm">
                  Your order number can be found in:
                </p>
                <ul className="text-blue-700 text-sm mt-1 space-y-1">
                  <li>• Your order confirmation email</li>
                  <li>• My Account → My Orders section</li>
                  <li>• Order tracking page</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Find Your Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="Enter your order number (e.g., ORD-12345)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={searchOrder} 
                  disabled={loading}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Order Number</Label>
                    <p className="font-medium">{order.order_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Customer Name</Label>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Order Date</Label>
                    <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                    <p className="font-medium">PKR {order.total_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Payment Status</Label>
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Delivery Address</Label>
                  <p className="font-medium">{order.customer_address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">PKR {(item.product_price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Return Section */}
            {canReturnOrder ? (
              <Card>
                <CardHeader>
                  <CardTitle>Return This Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="returnReason">Reason for Return</Label>
                    <Textarea
                      id="returnReason"
                      placeholder="Please explain why you want to return this order..."
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={submitReturn}
                    disabled={returning}
                    className="w-full bg-rose-500 hover:bg-rose-600"
                  >
                    {returning ? "Submitting Return..." : "Submit Return Request"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-orange-900">Cannot Return This Order</p>
                      <p className="text-orange-700 text-sm mt-1">
                        {order.status !== 'delivered' 
                          ? "Only delivered orders can be returned." 
                          : "This order is not eligible for return."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Returns;