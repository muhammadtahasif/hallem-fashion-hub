
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  const orderId = searchParams.get('order_id');
  const sessionToken = searchParams.get('session_token');

  useEffect(() => {
    if (orderId && sessionToken) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [orderId, sessionToken]);

  const verifyPayment = async () => {
    try {
      // Verify payment with backend
      const { data, error } = await supabase.functions.invoke('verify-safepay-payment', {
        body: {
          sessionToken,
          orderId
        }
      });

      if (error) throw error;

      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            product_price
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      setOrder(orderData);

      if (data.order_status === 'confirmed') {
        toast({
          title: "Payment Successful!",
          description: "Your order has been confirmed and will be processed soon.",
        });
      } else {
        toast({
          title: "Payment Verification",
          description: "We're verifying your payment. You'll receive confirmation shortly.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Verification Error",
        description: "There was an issue verifying your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Button onClick={() => navigate('/')} className="bg-rose-500 hover:bg-rose-600">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your order. We'll start processing it right away.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Order Number:</span>
                <span className="text-rose-600 font-mono">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold">PKR {order.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status === 'confirmed' ? 'Confirmed' : 'Processing'}
                </span>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Delivery Address:</h4>
                <p className="text-gray-600">
                  {order.customer_name}<br />
                  {order.customer_address}<br />
                  {order.customer_phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.product_name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span>PKR {(item.product_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/track-order')}
            className="flex-1 bg-rose-500 hover:bg-rose-600"
          >
            Track Your Order
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/shop')}
            className="flex-1"
          >
            Continue Shopping
          </Button>
        </div>

        <div className="text-center mt-8 text-gray-600">
          <p>You'll receive an email confirmation shortly.</p>
          <p>For any questions, please <Link to="/contact" className="text-rose-500 hover:underline">contact us</Link>.</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
