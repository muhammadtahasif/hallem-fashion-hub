
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, TrendingUp, Users, Calendar, DollarSign } from "lucide-react";

interface ReportsData {
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  totalSubcategories: number;
  totalReturns: number;
  totalRevenue: number;
  returnsThisMonth: number;
  ordersThisMonth: number;
  ordersToday: number;
  topSellingProducts: Array<{
    product_name: string;
    total_sold: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  returnsByStatus: Array<{
    status: string;
    count: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

const ReportsSection = () => {
  const [reportsData, setReportsData] = useState<ReportsData>({
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalReturns: 0,
    totalRevenue: 0,
    returnsThisMonth: 0,
    ordersThisMonth: 0,
    ordersToday: 0,
    topSellingProducts: [],
    ordersByStatus: [],
    returnsByStatus: [],
    revenueByMonth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      // Fetch basic counts
      const [ordersCount, productsCount, categoriesCount, subcategoriesCount, returnsCount] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('subcategories').select('*', { count: 'exact', head: true }),
        supabase.from('returns').select('*', { count: 'exact', head: true })
      ]);

      // Fetch orders data (excluding returned orders from revenue calculation)
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, status, id');

      // Get returned order IDs to exclude from revenue
      const { data: returnedOrders } = await supabase
        .from('returns')
        .select('order_id');
      
      const returnedOrderIds = new Set(returnedOrders?.map(r => r.order_id) || []);

      // Fetch returns data
      const { data: returns } = await supabase
        .from('returns')
        .select('status, created_at');

      // Calculate revenue and date-based metrics (excluding returned orders)
      const totalRevenue = orders?.reduce((sum, order) => {
        if (!returnedOrderIds.has(order.id)) {
          return sum + order.total_amount;
        }
        return sum;
      }, 0) || 0;
      
      const today = new Date().toDateString();
      const ordersToday = orders?.filter(order => 
        new Date(order.created_at).toDateString() === today
      ).length || 0;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const ordersThisMonth = orders?.filter(order => 
        new Date(order.created_at) >= thisMonth
      ).length || 0;

      // Returns this month
      const returnsThisMonth = returns?.filter(ret => 
        new Date(ret.created_at) >= thisMonth
      ).length || 0;

      // Returns by status
      const returnsByStatus = returns?.reduce((acc, ret) => {
        const existing = acc.find(item => item.status === ret.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: ret.status, count: 1 });
        }
        return acc;
      }, [] as Array<{ status: string; count: number }>) || [];

      // Orders by status
      const ordersByStatus = orders?.reduce((acc, order) => {
        const existing = acc.find(item => item.status === order.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: order.status, count: 1 });
        }
        return acc;
      }, [] as Array<{ status: string; count: number }>) || [];

      // Top selling products
      const { data: topProducts } = await supabase
        .from('order_items')
        .select('product_name, quantity')
        .order('quantity', { ascending: false });

      const topSellingProducts = topProducts?.reduce((acc, item) => {
        const existing = acc.find(p => p.product_name === item.product_name);
        if (existing) {
          existing.total_sold += item.quantity;
        } else {
          acc.push({ product_name: item.product_name, total_sold: item.quantity });
        }
        return acc;
      }, [] as Array<{ product_name: string; total_sold: number }>)
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5) || [];

      setReportsData({
        totalOrders: ordersCount.count || 0,
        totalProducts: productsCount.count || 0,
        totalCategories: categoriesCount.count || 0,
        totalSubcategories: subcategoriesCount.count || 0,
        totalReturns: returnsCount.count || 0,
        totalRevenue,
        returnsThisMonth,
        ordersThisMonth,
        ordersToday,
        topSellingProducts,
        ordersByStatus,
        returnsByStatus,
        revenueByMonth: []
      });

    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Store Reports & Analytics</h3>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-blue-600">{reportsData.totalOrders}</div>
                <p className="text-xs lg:text-sm text-gray-600">Total Orders</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-green-600">{reportsData.totalProducts}</div>
                <p className="text-xs lg:text-sm text-gray-600">Total Products</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-purple-600">{reportsData.totalCategories}</div>
                <p className="text-xs lg:text-sm text-gray-600">Categories</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-orange-600">{reportsData.totalSubcategories}</div>
                <p className="text-xs lg:text-sm text-gray-600">Subcategories</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Returns Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-red-600">{reportsData.totalReturns}</div>
                <p className="text-xs lg:text-sm text-gray-600">Total Returns</p>
              </div>
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-orange-600">{reportsData.returnsThisMonth}</div>
                <p className="text-xs lg:text-sm text-gray-600">Returns This Month</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Time-based Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-green-600">
                  PKR {(reportsData.totalRevenue / 1000).toFixed(0)}K
                </div>
                <p className="text-xs lg:text-sm text-gray-600">Total Revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-blue-600">{reportsData.ordersThisMonth}</div>
                <p className="text-xs lg:text-sm text-gray-600">Orders This Month</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-purple-600">{reportsData.ordersToday}</div>
                <p className="text-xs lg:text-sm text-gray-600">Orders Today</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportsData.topSellingProducts.length === 0 ? (
                <p className="text-gray-500">No sales data available</p>
              ) : (
                reportsData.topSellingProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{product.product_name}</span>
                    <span className="text-sm text-gray-600">{product.total_sold} sold</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportsData.ordersByStatus.length === 0 ? (
                <p className="text-gray-500">No order data available</p>
              ) : (
                reportsData.ordersByStatus.map((status, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{status.status}</span>
                    <span className="text-sm text-gray-600">{status.count} orders</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Returns by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Returns by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportsData.returnsByStatus.length === 0 ? (
                <p className="text-gray-500">No return data available</p>
              ) : (
                reportsData.returnsByStatus.map((status, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{status.status}</span>
                    <span className="text-sm text-gray-600">{status.count} returns</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsSection;
