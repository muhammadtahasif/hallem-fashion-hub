
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    product_price: number;
  }>;
}

interface OrdersPDFGeneratorProps {
  orders: Order[];
  status?: string;
}

const OrdersPDFGenerator = ({ orders, status = 'pending' }: OrdersPDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Filter orders by status
      const filteredOrders = orders.filter(order => 
        status === 'all' ? true : order.status.toLowerCase() === status.toLowerCase()
      );

      if (filteredOrders.length === 0) {
        toast({
          title: "No Orders Found",
          description: `No ${status} orders to export.`,
          variant: "destructive",
        });
        return;
      }

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Orders Report - ${status.charAt(0).toUpperCase() + status.slice(1)}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: #f8f9fa;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0 0 0;
              opacity: 0.9;
            }
            .order {
              background: white;
              margin-bottom: 20px;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              border-left: 4px solid #4CAF50;
            }
            .order-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #f0f0f0;
            }
            .order-number {
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            .order-status {
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-pending { background: #fff3cd; color: #856404; }
            .status-processing { background: #d1ecf1; color: #0c5460; }
            .status-shipped { background: #d4edda; color: #155724; }
            .status-delivered { background: #d4edda; color: #155724; }
            .status-cancelled { background: #f8d7da; color: #721c24; }
            .customer-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 15px;
            }
            .info-section {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              border: 1px solid #e9ecef;
            }
            .info-title {
              font-weight: bold;
              color: #495057;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .info-content {
              color: #6c757d;
              font-size: 13px;
              line-height: 1.5;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #dee2e6;
              padding: 12px;
              text-align: left;
            }
            .items-table th {
              background: #f8f9fa;
              font-weight: bold;
              color: #495057;
            }
            .total-row {
              background: #e3f2fd;
              font-weight: bold;
            }
            .total-amount {
              font-size: 18px;
              color: #1976d2;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding: 20px;
              background: #343a40;
              color: white;
              border-radius: 8px;
            }
            @media print {
              body { background: white; }
              .order { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>A&Z Fabrics - Orders Report</h1>
            <p>Status: ${status.charAt(0).toUpperCase() + status.slice(1)} Orders | Generated: ${new Date().toLocaleDateString()}</p>
            <p>Total Orders: ${filteredOrders.length}</p>
          </div>

          ${filteredOrders.map(order => `
            <div class="order">
              <div class="order-header">
                <span class="order-number">${order.order_number}</span>
                <span class="order-status status-${order.status}">${order.status}</span>
              </div>
              
              <div class="customer-info">
                <div class="info-section">
                  <div class="info-title">Customer Details</div>
                  <div class="info-content">
                    <strong>${order.customer_name}</strong><br>
                    📧 ${order.customer_email}<br>
                    📞 ${order.customer_phone}
                  </div>
                </div>
                
                <div class="info-section">
                  <div class="info-title">Order Information</div>
                  <div class="info-content">
                    📅 ${new Date(order.created_at).toLocaleDateString()}<br>
                    💳 ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}<br>
                    💰 Payment: ${order.payment_status}
                  </div>
                </div>
              </div>

              <div class="info-section">
                <div class="info-title">📍 Delivery Address</div>
                <div class="info-content">${order.customer_address}</div>
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.order_items.map(item => `
                    <tr>
                      <td>${item.product_name}</td>
                      <td>${item.quantity}</td>
                      <td>PKR ${item.product_price.toLocaleString()}</td>
                      <td>PKR ${(item.product_price * item.quantity).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3"><strong>Total Amount</strong></td>
                    <td class="total-amount"><strong>PKR ${order.total_amount.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          `).join('')}

          <div class="footer">
            <p><strong>A&Z Fabrics</strong> | Contact: +92 3090449955 | Email: digitaleyemedia25@gmail.com</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      // Create and download PDF
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${status}-orders-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Generated Successfully! 📄",
        description: `Downloaded ${filteredOrders.length} ${status} orders report.`,
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error Generating PDF",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      variant="outline"
      className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 font-medium"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {isGenerating ? 'Generating...' : `Download ${status.charAt(0).toUpperCase() + status.slice(1)} Orders PDF`}
      <FileText className="w-4 h-4" />
    </Button>
  );
};

export default OrdersPDFGenerator;
