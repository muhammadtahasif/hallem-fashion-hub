import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useShipping } from "@/hooks/useShipping";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductEditModal from "@/components/ProductEditModal";
import ProductAddModal from "@/components/ProductAddModal";
import CategoryManager from "@/components/CategoryManager";
import SubcategoryManager from "@/components/SubcategoryManager";
import ReportsSection from "@/components/ReportsSection";
import AdminOrdersTable from "@/components/AdminOrdersTable";
import { Trash2, Edit, Truck, Menu, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const { shippingCharges, updateShippingCharges } = useShipping();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  const [tempShippingCharges, setTempShippingCharges] = useState(shippingCharges.toString());
  const [activeTab, setActiveTab] = useState("reports");

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== 'digitaleyemedia25@gmail.com') {
        navigate('/login');
        return;
      }
      fetchDashboardData();
    }
  }, [user, loading]);

  useEffect(() => {
    setTempShippingCharges(shippingCharges.toString());
  }, [shippingCharges]);

  const saveShippingCharges = async () => {
    const charges = parseFloat(tempShippingCharges) || 0;
    const success = await updateShippingCharges(charges);
    
    if (success) {
      toast({
        title: "Shipping charges updated",
        description: "Shipping charges have been saved successfully.",
        variant: "default"
      });
    } else {
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

  const TabTriggerComponent = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <TabsTrigger 
      value={value} 
      className="flex-1 text-xs sm:text-sm px-2 sm:px-4 py-2 data-[state=active]:bg-rose-500 data-[state=active]:text-white"
      onClick={() => {
        setActiveTab(value);
        if (isMobile) setIsSidebarOpen(false);
      }}
    >
      {children}
    </TabsTrigger>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Button
            variant={activeTab === "reports" ? "default" : "ghost"}
            className="w-full justify-start text-left"
            onClick={() => {
              setActiveTab("reports");
              setIsSidebarOpen(false);
            }}
          >
            Reports
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            className="w-full justify-start text-left"
            onClick={() => {
              setActiveTab("orders");
              setIsSidebarOpen(false);
            }}
          >
            Orders
          </Button>
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            className="w-full justify-start text-left"
            onClick={() => {
              setActiveTab("products");
              setIsSidebarOpen(false);
            }}
          >
            Products
          </Button>
          <Button
            variant={activeTab === "categories" ? "default" : "ghost"}
            className="w-full justify-start text-left"
            onClick={() => {
              setActiveTab("categories");
              setIsSidebarOpen(false);
            }}
          >
            Categories
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start text-left"
            onClick={() => {
              setActiveTab("settings");
              setIsSidebarOpen(false);
            }}
          >
            Settings
          </Button>
        </div>
      </nav>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Welcome back, Administrator</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full sm:w-auto"
            size="sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {!isMobile && (
            <TabsList className="grid w-full grid-cols-5 h-auto p-1">
              <TabTriggerComponent value="reports">Reports</TabTriggerComponent>
              <TabTriggerComponent value="orders">Orders</TabTriggerComponent>
              <TabTriggerComponent value="products">Products</TabTriggerComponent>
              <TabTriggerComponent value="categories">Categories</TabTriggerComponent>
              <TabTriggerComponent value="settings">Settings</TabTriggerComponent>
            </TabsList>
          )}

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsSection />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <AdminOrdersTable />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg sm:text-xl">Product Management</CardTitle>
                  <Button 
                    size="sm" 
                    className="bg-rose-500 hover:bg-rose-600 w-full sm:w-auto"
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
                      <div className="flex-1 w-full lg:w-auto">
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
                            <p className="font-medium text-sm sm:text-base">{product.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600">SKU: {product.sku}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{product.categories?.name}</p>
                            <p className="text-sm sm:text-base font-medium">PKR {product.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                        <div className="text-left sm:text-right">
                          <p className="text-xs sm:text-sm">Stock: {product.stock}</p>
                          <Badge variant={product.stock > 5 ? "default" : "destructive"} className="text-xs">
                            {product.stock > 5 ? "In Stock" : "Low Stock"}
                          </Badge>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditModalOpen(true);
                            }}
                            className="flex-1 sm:flex-none text-xs"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setProductToDelete(product);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
                  <CardTitle className="text-lg">Store Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Store Name</label>
                    <Input
                      type="text"
                      defaultValue="A&Z Fabrics"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Phone</label>
                    <Input
                      type="tel"
                      defaultValue="+923234882256"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                    <Input
                      type="email"
                      defaultValue="digitaleyemedia25@gmail.com"
                      className="w-full"
                    />
                  </div>
                  <Button className="w-full bg-rose-500 hover:bg-rose-600">Update Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="h-5 w-5" />
                    Shipping Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="shippingCharges" className="block text-sm font-medium mb-2">
                      Shipping Charges (PKR)
                    </label>
                    <Input
                      id="shippingCharges"
                      type="number"
                      min="0"
                      value={tempShippingCharges}
                      onChange={(e) => setTempShippingCharges(e.target.value)}
                      placeholder="Enter shipping charges"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 0 to make shipping free
                    </p>
                  </div>
                  <Button 
                    onClick={saveShippingCharges} 
                    className="w-full bg-rose-500 hover:bg-rose-600"
                  >
                    Save Shipping Charges
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Email notifications for new orders</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">SMS notifications</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Low stock alerts</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Daily reports</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                  <Button className="w-full bg-rose-500 hover:bg-rose-600">Save Preferences</Button>
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Change Order Status</DialogTitle>
              <DialogDescription className="text-sm">
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
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleStatusChange} className="bg-rose-500 hover:bg-rose-600 w-full sm:w-auto">
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Product Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Delete Product</DialogTitle>
              <DialogDescription className="text-sm">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct} className="w-full sm:w-auto">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
