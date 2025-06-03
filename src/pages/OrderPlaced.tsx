
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Truck, ShoppingBag, Home, User } from "lucide-react";

const OrderPlaced = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order_number');
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto shadow-2xl border-0">
        <CardHeader className="text-center pb-4">
          <div className={`mx-auto mb-4 transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className="relative">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto animate-bounce" />
              <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            🎉 Order Placed Successfully!
          </CardTitle>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {orderNumber && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="font-bold text-lg text-green-700">{orderNumber}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">Order Confirmed</p>
                <p className="text-sm text-gray-600">We've received your order and it's being processed</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Truck className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-800">Processing Soon</p>
                <p className="text-sm text-gray-600">Your order will be shipped within 2-3 business days</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <Button 
              onClick={() => navigate('/shop')} 
              className="w-full bg-rose-500 hover:bg-rose-600 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Button>
            
            <Button 
              onClick={() => navigate('/account')} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Track Your Orders
            </Button>
            
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost" 
              className="w-full flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Need help? Contact us at</p>
            <p className="font-medium">+92 3090449955</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderPlaced;
