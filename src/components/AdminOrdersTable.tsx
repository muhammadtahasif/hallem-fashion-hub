
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
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

const AdminOrdersTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Order status has been updated successfully.",
      });

      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{order.order_number}</h3>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_email}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <p className="text-lg font-bold mt-1">
                    PKR {order.total_amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium">Delivery Address:</p>
                <p className="text-sm text-gray-600">{order.customer_address}</p>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium">Items:</p>
                <ul className="text-sm text-gray-600">
                  {order.order_items.map((item, index) => (
                    <li key={index}>
                      {item.product_name} - Qty: {item.quantity} - PKR {(item.product_price * item.quantity).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateOrderStatus(order.id, 'processing')}
                  disabled={order.status === 'processing'}
                >
                  Mark Processing
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateOrderStatus(order.id, 'shipped')}
                  disabled={order.status === 'shipped' || order.status === 'delivered'}
                >
                  Mark Shipped
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                  disabled={order.status === 'delivered'}
                >
                  Mark Delivered
                </Button>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrdersTable;
