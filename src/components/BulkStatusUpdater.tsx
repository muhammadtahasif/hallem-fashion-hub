import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckSquare, Square, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
}

interface BulkStatusUpdaterProps {
  orders: Order[];
  onUpdate: () => void;
}

const BulkStatusUpdater = ({ orders, onUpdate }: BulkStatusUpdaterProps) => {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [newStatus, setNewStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const selectAllOrders = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id)));
    }
  };

  const updateSelectedOrders = async () => {
    if (selectedOrders.size === 0 || !newStatus) {
      toast({
        title: "Selection Required",
        description: "Please select orders and choose a status.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .in('id', Array.from(selectedOrders));

      if (error) throw error;

      toast({
        title: "✅ Status Updated Successfully!",
        description: `Updated ${selectedOrders.size} orders to "${newStatus}".`,
      });

      setSelectedOrders(new Set());
      setNewStatus('');
      onUpdate();

    } catch (error) {
      console.error('Error updating orders:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteSelectedOrders = async () => {
    if (selectedOrders.size === 0) {
      toast({
        title: "Selection Required",
        description: "Please select orders to delete.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedOrders.size} selected orders? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const orderIds = Array.from(selectedOrders);

      // Delete order items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        throw itemsError;
      }

      // Then delete the orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .in('id', orderIds);

      if (ordersError) {
        console.error('Error deleting orders:', ordersError);
        throw ordersError;
      }

      toast({
        title: "🗑️ Orders Deleted Successfully!",
        description: `Deleted ${selectedOrders.size} orders.`,
      });

      setSelectedOrders(new Set());
      onUpdate();

    } catch (error) {
      console.error('Error deleting orders:', error);
      toast({
        title: "Error",
        description: "Failed to delete orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Bulk Order Management</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {selectedOrders.size} selected
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={selectAllOrders}
            className="flex items-center gap-2"
          >
            {selectedOrders.size === orders.length ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedOrders.size === orders.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          <Button
            onClick={updateSelectedOrders}
            disabled={isUpdating || selectedOrders.size === 0 || !newStatus}
            className="bg-rose-500 hover:bg-rose-600 flex items-center gap-2"
          >
            {isUpdating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Update Status
          </Button>

          <Button
            onClick={deleteSelectedOrders}
            disabled={isDeleting || selectedOrders.size === 0}
            variant="destructive"
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete Selected
          </Button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto border rounded-lg">
        <div className="space-y-2 p-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedOrders.has(order.id)
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => toggleOrderSelection(order.id)}
            >
              <div className="flex items-center gap-3">
                {selectedOrders.has(order.id) ? (
                  <CheckSquare className="w-5 h-5 text-rose-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-800">{order.order_number}</p>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                </div>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No orders available for bulk operations.
        </div>
      )}
    </div>
  );
};

export default BulkStatusUpdater;
