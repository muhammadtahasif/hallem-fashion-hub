
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

const CheckoutCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">Your payment was cancelled and no charges were made.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                You cancelled the payment process before it was completed. Don't worry - no charges have been made to your account.
              </p>
              {orderId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Order Reference:</strong> {orderId}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your order is still saved. You can complete the payment anytime.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/checkout')}
            className="flex-1 bg-rose-500 hover:bg-rose-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Payment Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/cart')}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Cart
          </Button>
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/shop')}
            className="text-gray-600 hover:text-gray-800"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
