
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, CreditCard, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    product_price: number;
  }>;
}

const MyOrdersTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            product_name,
            quantity,
            product_price
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'processing': return 'bg-blue-500 text-white';
      case 'shipped': return 'bg-purple-500 text-white';
      case 'delivered': return 'bg-green-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'confirmed': return 'bg-green-600 text-white';
      case 'payment_failed': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{order.order_number}</CardTitle>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <p className="text-lg font-bold mt-1 text-rose-600">
                  PKR {order.total_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items
                </h4>
                <div className="space-y-2">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <Link 
                          to={`/product/${item.product_id}`}
                          className="font-medium text-rose-600 hover:text-rose-800 transition-colors"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">
                        PKR {(item.product_price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {order.payment_method === 'cod' ? (
                      <Truck className="w-4 h-4 text-gray-600" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="font-medium">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                  {order.payment_method === 'online' && (
                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                      Payment {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/track-order?order=${order.order_number}&phone=${encodeURIComponent(order.customer_phone || '')}`, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Button onClick={() => window.location.href = '/shop'} className="bg-rose-500 hover:bg-rose-600">
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyOrdersTable;
