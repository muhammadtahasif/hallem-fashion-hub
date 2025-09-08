
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
    variant_price?: number;
    selected_color?: string;
    selected_size?: string;
    products?: {
      sku: string;
    };
  }>;
}

interface OrdersPDFGeneratorProps {
  orders: Order[];
  title?: string;
}

const OrdersPDFGenerator = ({ orders, title = "Orders Report" }: OrdersPDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Define colors
      const primaryColor: [number, number, number] = [236, 72, 153];
      const headerBgColor: [number, number, number] = [249, 250, 251];
      const borderColor: [number, number, number] = [229, 231, 235];
      const textDark: [number, number, number] = [31, 41, 55];
      const textMuted: [number, number, number] = [107, 114, 128];

      let currentY = 20;

      // Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('A&Z FABRICS', 15, 18);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Premium Fashion Collection', 15, 25);
      
      doc.setFontSize(7);
      doc.text('📞 +923234882256 | ✉️ digitaleyemedia25@gmail.com', pageWidth - 80, 20);

      currentY = 40;

      // Report title
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, currentY);
      
      currentY += 10;

      // Summary
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      doc.text(`Generated: ${currentDate}`, 15, currentY);
      doc.text(`Total Orders: ${orders.length}`, 15, currentY + 6);
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      doc.text(`Total Revenue: PKR ${totalRevenue.toLocaleString()}`, 15, currentY + 12);

      currentY += 25;

      // Individual Order Receipts
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        
        // Check if we need a new page
        if (currentY > pageHeight - 80) {
          doc.addPage();
          currentY = 20;
        }

        // Order header box
        doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
        doc.roundedRect(15, currentY, pageWidth - 30, 20, 2, 2, 'F');
        
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(15, currentY, pageWidth - 30, 20, 2, 2, 'S');
        
        // Order number and status
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`ORDER: ${order.order_number}`, 20, currentY + 8);
        
        // Status badge
        const statusColors = {
          pending: [252, 211, 77],
          processing: [96, 165, 250],
          shipped: [168, 85, 247],
          delivered: [52, 211, 153],
          cancelled: [248, 113, 113]
        };
        const statusColor = statusColors[order.status.toLowerCase() as keyof typeof statusColors] || [156, 163, 175];
        
        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.roundedRect(pageWidth - 60, currentY + 3, 35, 8, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(order.status.toUpperCase(), pageWidth - 43, currentY + 7.5, { align: 'center' });
        
        // Date and amount
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date(order.created_at).toLocaleDateString(), 20, currentY + 15);
        
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`PKR ${order.total_amount.toLocaleString()}`, pageWidth - 25, currentY + 15, { align: 'right' });

        currentY += 25;

        // Customer details section
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, currentY, pageWidth - 30, 25, 2, 2, 'F');
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.roundedRect(15, currentY, pageWidth - 30, 25, 2, 2, 'S');
        
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('CUSTOMER DETAILS', 20, currentY + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`Name: ${order.customer_name}`, 20, currentY + 14);
        doc.text(`Email: ${order.customer_email}`, 20, currentY + 18);
        doc.text(`Phone: ${order.customer_phone}`, 20, currentY + 22);
        
        // Address (word wrap)
        const addressLines = doc.splitTextToSize(`Address: ${order.customer_address}`, pageWidth - 50);
        doc.text(addressLines, pageWidth / 2 + 10, currentY + 14);

        currentY += 30;

        // Order items table
        const itemsData = order.order_items.map(item => {
          const actualPrice = item.variant_price || item.product_price;
          const variantInfo = [];
          if (item.selected_color) variantInfo.push(`Color: ${item.selected_color}`);
          if (item.selected_size) variantInfo.push(`Size: ${item.selected_size}`);
          
          // Create detailed product description with clear variant info
          let productDescription = item.product_name;
          if (variantInfo.length > 0) {
            productDescription += `\n• ${variantInfo.join('\n• ')}`;
          }
          
          return [
            productDescription,
            item.quantity.toString(),
            `PKR ${actualPrice.toLocaleString()}`,
            `PKR ${(item.quantity * actualPrice).toLocaleString()}`
          ];
        });

        autoTable(doc, {
          head: [['Product', 'Qty', 'Price', 'Total']],
          body: itemsData,
          startY: currentY,
          theme: 'grid',
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7,
            cellPadding: 2,
          },
          bodyStyles: {
            fontSize: 6,
            cellPadding: 2,
            textColor: textDark,
          },
          columnStyles: {
            0: { cellWidth: (pageWidth - 30) * 0.5 },
            1: { cellWidth: (pageWidth - 30) * 0.15, halign: 'center' },
            2: { cellWidth: (pageWidth - 30) * 0.175, halign: 'right' },
            3: { cellWidth: (pageWidth - 30) * 0.175, halign: 'right' },
          },
          margin: { left: 15, right: 15 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        // Order total box
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.roundedRect(pageWidth - 80, currentY, 65, 12, 2, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: PKR ${order.total_amount.toLocaleString()}`, pageWidth - 47.5, currentY + 7, { align: 'center' });

        currentY += 20;

        // Separator line
        if (i < orders.length - 1) {
          doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
          doc.setLineWidth(0.5);
          doc.line(15, currentY, pageWidth - 15, currentY);
          currentY += 10;
        }
      }

      // Footer
      doc.setFontSize(6);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('A&Z Fabrics - This is a computer-generated document.', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save the PDF
      const fileName = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating || orders.length === 0}
      className="bg-rose-500 hover:bg-rose-600 text-white"
      size="sm"
    >
      {isGenerating ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Generating...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </div>
      )}
    </Button>
  );
};

export default OrdersPDFGenerator;
