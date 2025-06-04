
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const generatePDF = async (orders: any[], status: string, toast: any) => {
  try {
    console.log('Starting PDF generation for', orders.length, 'orders');
    
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');

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
    
    // Professional Header with Company Branding
    pdf.setFillColor(236, 72, 153); // Rose color
    pdf.rect(0, 0, 210, 35, 'F');
    
    // Company Logo/Name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('A&Z FABRICS', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Premium Fashion Collection', 20, 28);
    
    // Contact Info
    pdf.setFontSize(10);
    pdf.text('Phone: +92 3090449955 | Email: info@azfabrics.com', 20, 32);
    
    // Report Title Section
    pdf.setTextColor(51, 51, 51);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ORDERS REPORT', 20, 50);
    
    // Report Details Box
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(20, 55, 170, 25, 'FD');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    pdf.text(`Report Type: ${statusText} Orders`, 25, 65);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 25, 72);
    pdf.text(`Total Orders: ${filteredOrders.length}`, 25, 79);

    // Summary Statistics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
    pdf.text(`Total Revenue: PKR ${totalRevenue.toLocaleString()}`, 120, 65);
    pdf.text(`Average Order: PKR ${Math.round(totalRevenue / filteredOrders.length).toLocaleString()}`, 120, 72);

    let yPosition = 95;

    // Orders Section
    filteredOrders.forEach((order, index) => {
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 20;
      }

      // Order Card Design
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(20, yPosition, 170, 8, 'FD');
      
      // Order Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(`${order.order_number}`, 25, yPosition + 5);
      
      // Status Badge
      const statusColors = {
        'pending': [255, 146, 43],
        'confirmed': [34, 197, 94],
        'shipped': [59, 130, 246],
        'delivered': [16, 185, 129],
        'cancelled': [239, 68, 68]
      };
      
      const statusColor = statusColors[order.status.toLowerCase()] || [107, 114, 128];
      pdf.setFillColor(...statusColor);
      pdf.rect(145, yPosition + 1, 35, 6, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(order.status.toUpperCase(), 147, yPosition + 5);
      
      // Amount
      pdf.setTextColor(236, 72, 153);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`PKR ${order.total_amount.toLocaleString()}`, 182, yPosition + 5);

      yPosition += 12;

      // Customer Information Section
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPosition, 170, 20, 'F');
      
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CUSTOMER DETAILS', 25, yPosition + 6);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Name: ${order.customer_name}`, 25, yPosition + 11);
      pdf.text(`Email: ${order.customer_email}`, 25, yPosition + 16);
      
      pdf.text(`Phone: ${order.customer_phone}`, 110, yPosition + 11);
      pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 110, yPosition + 16);

      yPosition += 25;

      // Address
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Address: ${order.customer_address}`, 25, yPosition);
      yPosition += 8;

      // Items Table
      const tableData = order.order_items.map((item: any) => [
        item.product_name,
        item.quantity.toString(),
        `PKR ${item.product_price.toLocaleString()}`,
        `PKR ${(item.product_price * item.quantity).toLocaleString()}`
      ]);

      try {
        (pdf as any).autoTable({
          startY: yPosition,
          head: [['Product', 'Qty', 'Unit Price', 'Total']],
          body: tableData,
          margin: { left: 20, right: 20 },
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            lineColor: [229, 231, 235],
            lineWidth: 0.5
          },
          headStyles: { 
            fillColor: [236, 72, 153],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [55, 65, 81]
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          tableWidth: 170
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 15;
      } catch (tableError) {
        console.error('Error creating table for order:', order.order_number, tableError);
        yPosition += 30;
      }

      // Order separator line
      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 10;
    });

    // Professional Footer
    try {
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        // Footer background
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, (pdf as any).internal.pageSize.height - 25, 210, 25, 'F');
        
        // Footer content
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        pdf.text('A&Z Fabrics - Premium Fashion Collection', 20, (pdf as any).internal.pageSize.height - 15);
        pdf.text('Contact: +92 3090449955 | www.azfabrics.com', 20, (pdf as any).internal.pageSize.height - 8);
        
        // Page number
        pdf.setTextColor(156, 163, 175);
        pdf.text(`Page ${i} of ${pageCount}`, (pdf as any).internal.pageSize.width - 40, (pdf as any).internal.pageSize.height - 8);
        
        // Report timestamp
        pdf.text(`Report generated on ${new Date().toLocaleDateString()}`, (pdf as any).internal.pageSize.width - 80, (pdf as any).internal.pageSize.height - 15);
      }
    } catch (footerError) {
      console.error('Error adding footer:', footerError);
    }

    const fileName = `AZ-Fabrics-${statusText}-Orders-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    toast({
      title: "Professional PDF Generated! 📄✨",
      description: `Downloaded ${filteredOrders.length} ${status} orders report with professional styling.`,
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    toast({
      title: "PDF Generation Failed",
      description: "There was an error generating the PDF. Please try again.",
      variant: "destructive",
    });
  }
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
      className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-700 font-medium shadow-sm transition-all duration-200"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {isGenerating ? 'Generating Professional PDF...' : `Download ${status.charAt(0).toUpperCase() + status.slice(1)} Orders PDF`}
      <FileText className="w-4 h-4" />
    </Button>
  );
};

export default OrdersPDFGenerator;
