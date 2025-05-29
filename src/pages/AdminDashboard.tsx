import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductEditModal from "@/components/ProductEditModal";
import ProductAddModal from "@/components/ProductAddModal";
import CategoryManager from "@/components/CategoryManager";
import SubcategoryManager from "@/components/SubcategoryManager";
import ReportsSection from "@/components/ReportsSection";
import { Eye, Trash2, MapPin, Phone, Mail, Package, Calendar, Edit, Settings } from "lucide-react";

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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  image_url: string;
  featured: boolean;
  sku: string;
  categories?: {
    name: string;
  };
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [statusChangeOrder, setStatusChangeOrder] = useState<Order | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [shippingCharges, setShippingCharges] = useState(0);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== 'digitaleyemedia25@gmail.com') {
        navigate('/login');
        return;
      }
      fetchDashboardData();
      fetchShippingCharges();
    }
  }, [user, loading]);

  const fetchShippingCharges = async () => {
    try {
      // For now, we'll store shipping charges in localStorage
      // In a real app, you'd store this in the database
      const stored = localStorage.getItem('shipping_charges');
      if (stored) {
        setShippingCharges(parseFloat(stored));
      }
    } catch (error) {
      console.error('Error fetching shipping charges:', error);
    }
  };

  const updateShippingCharges = async () => {
    try {
      localStorage.setItem('shipping_charges', shippingCharges.toString());
      toast({
        title: "Shipping charges updated",
        description: "Shipping charges have been updated successfully.",
        variant: "default"
      });
      setIsShippingDialogOpen(false);
    } catch (error) {
      console.error('Error updating shipping charges:', error);
      toast({
        title: "Error",
        description: "Failed to update shipping charges.",
        variant: "destructive"
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch orders with product SKUs
      const { data: ordersData, error: ordersError } = await supabase
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

      if (ordersError) throw ordersError;

      // Fetch products with SKU
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          original_price,
          stock,
          image_url,
          featured,
          sku,
          categories (
            name
          )
        `);

      if (productsError) throw productsError;

      setOrders(ordersData || []);
      setProducts(productsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive"
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order updated",
        description: "Order status has been updated successfully.",
        variant: "default"
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
        variant: "default"
      });

      fetchDashboardData();
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) throw orderError;

      toast({
        title: "Order deleted",
        description: "Order has been deleted successfully.",
        variant: "default"
      });

      // Refresh the orders list
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order.",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = () => {
    if (statusChangeOrder && newStatus) {
      updateOrderStatus(statusChangeOrder.id, newStatus);
      setIsStatusDialogOpen(false);
      setStatusChangeOrder(null);
      setNewStatus("");
    }
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, Administrator</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsShippingDialogOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Shipping Charges
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              Back to Store
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsSection />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 lg:p-6 bg-white shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div>
                                <p className="font-bold text-lg">{order.order_number}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${getStatusColor(order.status)} text-white capitalize`}>
                                  {order.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setStatusChangeOrder(order);
                                    setNewStatus(order.status);
                                    setIsStatusDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Change
                                </Button>
                              </div>
                            </div>

                            {/* Customer Information */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  Customer Details
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p className="font-medium">{order.customer_name}</p>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Mail className="h-3 w-3" />
                                    {order.customer_email}
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    {order.customer_phone}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Shipping Address
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{order.customer_address}</p>
                              </div>
                            </div>

                            {/* Order Items with SKU */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Order Items:</h4>
                              <div className="space-y-1">
                                {order.order_items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                                    <div>
                                      <span>{item.product_name} × {item.quantity}</span>
                                      {item.products?.sku && (
                                        <div className="text-xs text-gray-500">SKU: {item.products.sku}</div>
                                      )}
                                    </div>
                                    <span className="font-medium">PKR {(item.product_price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                                <span>Total Amount:</span>
                                <span className="text-rose-500">PKR {order.total_amount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 lg:w-32">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600 hover:text-red-700 w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle>Product Management</CardTitle>
                  <Button 
                    size="sm" 
                    className="bg-rose-500 hover:bg-rose-600"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Add New Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                            <p className="text-sm text-gray-600">{product.categories?.name}</p>
                            <p className="text-sm font-medium">PKR {product.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                        <div className="text-left sm:text-right">
                          <p className="text-sm">Stock: {product.stock}</p>
                          <Badge variant={product.stock > 5 ? "default" : "destructive"}>
                            {product.stock > 5 ? "In Stock" : "Low Stock"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setProductToDelete(product);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="space-y-6">
              <CategoryManager />
              <SubcategoryManager />
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Store Name</label>
                    <input
                      type="text"
                      defaultValue="A&Z Fabrics"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      defaultValue="+92 3090449955"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                    <input
                      type="email"
                      defaultValue="digitaleyemedia25@gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Shipping Charges</label>
                    <p className="text-lg font-semibold text-rose-500">PKR {shippingCharges.toLocaleString()}</p>
                  </div>
                  <Button className="w-full">Update Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Email notifications for new orders</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SMS notifications</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low stock alerts</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <Button className="w-full">Save Preferences</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ProductEditModal
          product={selectedProduct}
          isOpen={isEditModalOpen}
          onClose={() => {
            setSelectedProduct(null);
            setIsEditModalOpen(false);
          }}
          onUpdate={fetchDashboardData}
        />

        <ProductAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={fetchDashboardData}
        />

        {/* Status Change Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Order Status</DialogTitle>
              <DialogDescription>
                Select the new status for order {statusChangeOrder?.order_number}
              </DialogDescription>
            </DialogHeader>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusChange} className="bg-rose-500 hover:bg-rose-600">
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Product Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Shipping Charges Dialog */}
        <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Shipping Charges</DialogTitle>
              <DialogDescription>
                Set the shipping charges that will be applied to all orders.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Shipping Charges (PKR)</label>
                <Input
                  type="number"
                  value={shippingCharges}
                  onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
                  placeholder="Enter shipping charges"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShippingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateShippingCharges} className="bg-rose-500 hover:bg-rose-600">
                Update Charges
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
