
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  // Mock authentication check - will be replaced with real auth
  const checkAuth = () => {
    if (adminEmail === "digitaleyemedia25@gmail.com") {
      setIsAuthenticated(true);
      toast({
        title: "Welcome, Administrator!",
        description: "You now have access to the admin dashboard.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Only administrators can access this page.",
        variant: "destructive"
      });
    }
  };

  // Mock data - will be replaced with real data from Supabase
  const stats = {
    totalOrders: 156,
    pendingOrders: 12,
    totalProducts: 45,
    totalRevenue: 487500,
    todaysOrders: 8
  };

  const recentOrders = [
    { id: "ALH-2024-001", customer: "Fatima Khan", product: "Royal Blue Dupatta", amount: 2500, status: "shipped" },
    { id: "ALH-2024-002", customer: "Ayesha Ali", product: "Pink Lawn Suit", amount: 4500, status: "processing" },
    { id: "ALH-2024-003", customer: "Zara Ahmed", product: "Silk Fabric", amount: 1800, status: "pending" },
    { id: "ALH-2024-004", customer: "Maria Hassan", product: "Chiffon Party Wear", amount: 6500, status: "delivered" }
  ];

  const products = [
    { id: 1, name: "Royal Blue Embroidered Dupatta", price: 2500, stock: 15, category: "dupattas" },
    { id: 2, name: "Elegant Pink Lawn Suit", price: 4500, stock: 8, category: "ready-made" },
    { id: 3, name: "Premium Silk Fabric", price: 1800, stock: 25, category: "unstitched" },
    { id: 4, name: "Chiffon Party Wear", price: 6500, stock: 3, category: "ready-made" }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen fashion-gradient flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center font-serif">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="digitaleyemedia25@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <Button onClick={checkAuth} className="w-full bg-rose-500 hover:bg-rose-600">
              Access Dashboard
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Demo: Use digitaleyemedia25@gmail.com to access
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, Administrator</p>
          </div>
          <Button
            onClick={() => {
              setIsAuthenticated(false);
              setAdminEmail("");
            }}
            variant="outline"
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-rose-500">{stats.totalOrders}</div>
              <p className="text-sm text-gray-600">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-500">{stats.pendingOrders}</div>
              <p className="text-sm text-gray-600">Pending Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-500">{stats.totalProducts}</div>
              <p className="text-sm text-gray-600">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-500">
                PKR {(stats.totalRevenue / 1000).toFixed(0)}K
              </div>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-500">{stats.todaysOrders}</div>
              <p className="text-sm text-gray-600">Today's Orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button size="sm">View All Orders</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{order.product}</p>
                            <p className="text-sm font-medium">PKR {order.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(order.status)} text-white capitalize`}>
                          {order.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Management</CardTitle>
                  <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                    Add New Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600 capitalize">{product.category.replace('-', ' ')}</p>
                            <p className="text-sm font-medium">PKR {product.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm">Stock: {product.stock}</p>
                          <Badge variant={product.stock > 5 ? "default" : "destructive"}>
                            {product.stock > 5 ? "In Stock" : "Low Stock"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Delete</Button>
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Category Management</CardTitle>
                  <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Dupattas', 'Ready-Made', 'Unstitched'].map((category) => (
                    <div key={category} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{category}</h3>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {category === 'Dupattas' ? '15' : category === 'Ready-Made' ? '18' : '12'} products
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                      defaultValue="AL - HALLEM"
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
      </div>
    </div>
  );
};

export default AdminDashboard;
