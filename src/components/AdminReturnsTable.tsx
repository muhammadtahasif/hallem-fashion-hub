import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Filter, Calendar } from "lucide-react";

interface ReturnItem {
  id: string;
  product_name: string;
  quantity: number;
  product_price: number;
}

interface Return {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  reason: string;
  status: string;
  created_at: string;
  return_items: ReturnItem[];
}

const AdminReturnsTable = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    filterReturns();
  }, [returns, searchTerm, statusFilter]);

  const fetchReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select(`
          *,
          return_items (
            id,
            product_name,
            quantity,
            product_price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturns(data || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast({
        title: "Error",
        description: "Failed to load returns.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterReturns = () => {
    let filtered = returns;

    if (searchTerm) {
      filtered = filtered.filter(ret =>
        ret.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(ret => ret.status === statusFilter);
    }

    setFilteredReturns(filtered);
  };

  const updateReturnStatus = async (returnId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('returns')
        .update({ status: newStatus })
        .eq('id', returnId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Return status has been updated successfully.",
        variant: "default"
      });

      fetchReturns();
    } catch (error) {
      console.error('Error updating return status:', error);
      toast({
        title: "Error",
        description: "Failed to update return status.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Returns Management
            <Badge variant="secondary">{filteredReturns.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Returns Table */}
          <div className="space-y-4">
            {filteredReturns.map((returnItem) => (
              <div key={returnItem.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Order #{returnItem.order_number}</h3>
                      <Badge variant={getStatusBadgeVariant(returnItem.status)}>
                        {returnItem.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Customer: {returnItem.customer_name}</p>
                    <p className="text-sm text-gray-600">Amount: PKR {returnItem.total_amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(returnItem.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedReturn(returnItem)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Return Details - Order #{returnItem.order_number}</DialogTitle>
                        </DialogHeader>
                        {selectedReturn && (
                          <div className="space-y-6">
                            {/* Customer Information */}
                            <div>
                              <h4 className="font-medium mb-2">Customer Information</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Name:</span>
                                  <p className="font-medium">{selectedReturn.customer_name}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Email:</span>
                                  <p className="font-medium">{selectedReturn.customer_email}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Phone:</span>
                                  <p className="font-medium">{selectedReturn.customer_phone}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Total Amount:</span>
                                  <p className="font-medium">PKR {selectedReturn.total_amount.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="text-gray-500">Address:</span>
                                <p className="font-medium">{selectedReturn.customer_address}</p>
                              </div>
                            </div>

                            {/* Return Reason */}
                            <div>
                              <h4 className="font-medium mb-2">Return Reason</h4>
                              <p className="text-sm bg-gray-50 p-3 rounded">{selectedReturn.reason}</p>
                            </div>

                            {/* Returned Items */}
                            <div>
                              <h4 className="font-medium mb-2">Returned Items</h4>
                              <div className="space-y-2">
                                {selectedReturn.return_items.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                      <p className="font-medium text-sm">{item.product_name}</p>
                                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium text-sm">PKR {(item.product_price * item.quantity).toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Status Update */}
                            <div>
                              <h4 className="font-medium mb-2">Update Status</h4>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateReturnStatus(selectedReturn.id, 'approved')}
                                  disabled={selectedReturn.status === 'approved'}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateReturnStatus(selectedReturn.id, 'rejected')}
                                  disabled={selectedReturn.status === 'rejected'}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateReturnStatus(selectedReturn.id, 'completed')}
                                  disabled={selectedReturn.status === 'completed'}
                                >
                                  Complete
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Return Reason Preview */}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reason:</span> {returnItem.reason}
                  </p>
                </div>
              </div>
            ))}

            {filteredReturns.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No returns found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReturnsTable;