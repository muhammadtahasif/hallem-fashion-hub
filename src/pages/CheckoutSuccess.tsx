
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight, Sparkles, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const orderId = searchParams.get('order_id');
  const sessionToken = searchParams.get('session_token');

  useEffect(() => {
    if (orderId && sessionToken) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [orderId, sessionToken]);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setShowAnimation(true), 100);
  }, []);

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
          title: "🎉 Payment Successful!",
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-600 animate-pulse" />
          </div>
          <p className="text-lg font-medium text-gray-700">Verifying your payment...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your transaction</p>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Animation */}
        <div className={`text-center mb-8 transition-all duration-1000 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6 shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white animate-bounce" />
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            <Gift className="absolute -bottom-2 -left-2 w-5 h-5 text-purple-400 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🎉 Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 font-medium">Thank you for your order! We'll start processing it right away.</p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-green-700 font-medium">Order Confirmed</span>
          </div>
        </div>

        {/* Order Details Card */}
        <Card className={`mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-700 delay-300 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Package className="w-6 h-6" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Order Number:</span>
                <span className="text-rose-600 font-bold font-mono text-lg">{order.order_number}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Total Amount:</span>
                <span className="font-bold text-2xl text-green-600">PKR {order.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status === 'confirmed' ? '✅ Confirmed' : '⏳ Processing'}
                </span>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Delivery Address:
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-800">{order.customer_name}</p>
                  <p className="text-gray-600 mt-1">{order.customer_address}</p>
                  <p className="text-gray-600">{order.customer_phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Card */}
        <Card className={`mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-700 delay-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Items Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <div>
                    <span className="font-medium text-gray-800">{item.product_name}</span>
                    <span className="text-blue-600 ml-2 font-semibold">×{item.quantity}</span>
                  </div>
                  <span className="font-bold text-green-600">PKR {(item.product_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-700 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button 
            onClick={() => navigate('/track-order')}
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Track Your Order
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/shop')}
            className="flex-1 border-2 border-gray-300 hover:bg-gray-50 font-semibold py-3 transform hover:scale-105 transition-all duration-200"
          >
            Continue Shopping
          </Button>
        </div>

        {/* Footer Message */}
        <div className={`text-center mt-8 space-y-2 transition-all duration-700 delay-900 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
            <p className="text-gray-700 font-medium">You'll receive an email confirmation shortly.</p>
          </div>
          <p className="text-gray-600">
            For any questions, please <Link to="/contact" className="text-rose-500 hover:underline font-semibold">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
