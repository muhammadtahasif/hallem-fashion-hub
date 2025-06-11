
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Download, Calendar, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    products?: {
      sku: string;
    };
  }>;
}

const AdminOrdersTable = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [dateFilter, setDateFilter] = useState("all-time");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          total_amount,
          status,
          created_at,
          order_items (
            product_name,
            quantity,
            product_price,
            products (
              sku
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all-statuses") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter && dateFilter !== "all-time") {
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
        case 'filter-today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'filter-2days':
          startDate.setDate(now.getDate() - 2);
          break;
        case 'filter-week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'filter-month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(order => 
        new Date(order.created_at) >= startDate
      );
    }

    setFilteredOrders(filtered);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedOrders.length} selected orders? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete order items first
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', selectedOrders);

      if (itemsError) throw itemsError;

      // Then delete orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .in('id', selectedOrders);

      if (ordersError) throw ordersError;

      toast({
        title: "Orders deleted",
        description: `${selectedOrders.length} orders have been deleted successfully.`,
        variant: "default"
      });

      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting orders:', error);
      toast({
        title: "Error",
        description: "Failed to delete orders.",
        variant: "destructive"
      });
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Orders Report', 14, 22);
    
    // Add date range info
    doc.setFontSize(12);
    let dateRangeText = 'All Orders';
    if (dateFilter && dateFilter !== "all-time") {
      const filterText = {
        'filter-today': 'Today',
        'filter-2days': 'Last 2 Days',
        'filter-week': 'Last Week',
        'filter-month': 'Last Month'
      };
      dateRangeText = filterText[dateFilter as keyof typeof filterText] || 'All Orders';
    }
    doc.text(`Date Range: ${dateRangeText}`, 14, 32);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 42);

    // Prepare table data
    const tableData = filteredOrders.map(order => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.status,
      `PKR ${order.total_amount.toLocaleString()}`,
      new Date(order.created_at).toLocaleDateString()
    ]);

    // Add table
    autoTable(doc, {
      head: [['Order #', 'Customer', 'Email', 'Status', 'Amount', 'Date']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [239, 68, 68] },
    });

    // Add summary
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    
    doc.setFontSize(12);
    doc.text(`Total Orders: ${filteredOrders.length}`, 14, finalY + 20);
    doc.text(`Total Revenue: PKR ${totalRevenue.toLocaleString()}`, 14, finalY + 30);

    // Save PDF
    doc.save(`orders-report-${dateFilter === "all-time" ? "all" : dateFilter}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusFilterChange = (value: string) => {
    console.log('Status filter changing to:', value);
    if (value && value.trim() !== '') {
      setStatusFilter(value);
    }
  };

  const handleDateFilterChange = (value: string) => {
    console.log('Date filter changing to:', value);
    if (value && value.trim() !== '') {
      setDateFilter(value);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading orders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <CardTitle className="text-xl">Orders Management</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {selectedOrders.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedOrders.length})
              </Button>
            )}
            <Button
              onClick={downloadPDF}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="filter-today">Today</SelectItem>
              <SelectItem value="filter-2days">Last 2 Days</SelectItem>
              <SelectItem value="filter-week">Last Week</SelectItem>
              <SelectItem value="filter-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all-statuses");
              setDateFilter("all-time");
            }}
          >
            Clear Filters
          </Button>
        </div>

        {/* Mobile View */}
        {isMobile ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                    />
                    <div>
                      <p className="font-medium text-sm">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{order.customer_name}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-medium">Amount:</span> PKR {order.total_amount.toLocaleString()}</p>
                  <p className="text-sm"><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600">{order.customer_email}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Desktop Table */
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-600">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>PKR {order.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.order_items.map((item, index) => (
                          <div key={index}>
                            {item.product_name} (x{item.quantity})
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrdersTable;
