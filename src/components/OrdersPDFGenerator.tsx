
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Dynamic imports for jsPDF to avoid SSR issues
const generatePDF = async (orders: any[], status: string, toast: any) => {
  const jsPDF = (await import('jspdf')).default;
  await import('jspdf-autotable');

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

  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text('A&Z Fabrics - Orders Report', 20, 30);
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Status: ${status.charAt(0).toUpperCase() + status.slice(1)} Orders`, 20, 40);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
  pdf.text(`Total Orders: ${filteredOrders.length}`, 20, 60);

  let yPosition = 80;

  filteredOrders.forEach((order, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Order header
    pdf.setFontSize(14);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Order: ${order.order_number}`, 20, yPosition);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Status: ${order.status}`, 120, yPosition);
    pdf.text(`PKR ${order.total_amount.toLocaleString()}`, 160, yPosition);

    yPosition += 10;

    // Customer details
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Customer: ${order.customer_name}`, 20, yPosition);
    pdf.text(`Email: ${order.customer_email}`, 20, yPosition + 8);
    pdf.text(`Phone: ${order.customer_phone}`, 20, yPosition + 16);
    
    yPosition += 25;

    // Address
    pdf.text(`Address: ${order.customer_address}`, 20, yPosition);
    yPosition += 10;

    // Items table
    const tableData = order.order_items.map((item: any) => [
      item.product_name,
      item.quantity.toString(),
      `PKR ${item.product_price.toLocaleString()}`,
      `PKR ${(item.product_price * item.quantity).toLocaleString()}`
    ]);

    (pdf as any).autoTable({
      startY: yPosition,
      head: [['Product', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      margin: { left: 20 },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 220, 220] }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // Order date
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Order Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, yPosition);
    
    yPosition += 20;
  });

  // Footer - using getNumberOfPages with proper type casting
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  const pageCount = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.text(`A&Z Fabrics | Contact: +92 3090449955`, 20, (pdf as any).internal.pageSize.height - 20);
    pdf.text(`Page ${i} of ${pageCount}`, (pdf as any).internal.pageSize.width - 40, (pdf as any).internal.pageSize.height - 20);
  }

  // Download PDF
  pdf.save(`${status}-orders-${new Date().toISOString().split('T')[0]}.pdf`);

  toast({
    title: "PDF Generated Successfully! 📄",
    description: `Downloaded ${filteredOrders.length} ${status} orders report.`,
  });
};

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

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      await generatePDF(orders, status, toast);
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
      onClick={handleGeneratePDF}
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
