
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
      
      // Define colors as tuples
      const primaryColor: [number, number, number] = [236, 72, 153]; // Rose 500
      const headerBgColor: [number, number, number] = [249, 250, 251]; // Gray 50
      const borderColor: [number, number, number] = [229, 231, 235]; // Gray 200
      const textDark: [number, number, number] = [31, 41, 55]; // Gray 800
      const textMuted: [number, number, number] = [107, 114, 128]; // Gray 500

      // Header section
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('A&Z FABRICS', 15, 18);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Premium Fashion Collection', 15, 25);
      
      // Contact info in header
      doc.setFontSize(7);
      doc.text('📞 +923234882256 | ✉️ digitaleyemedia25@gmail.com', pageWidth - 80, 20);

      // Report title
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, 42);
      
      // Date and summary info
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      doc.text(`Generated: ${currentDate}`, 15, 50);
      doc.text(`Total Orders: ${orders.length}`, 15, 56);
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      doc.text(`Total Revenue: PKR ${totalRevenue.toLocaleString()}`, 15, 62);

      // Decorative line
      doc.setLineWidth(0.3);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.line(15, 68, pageWidth - 15, 68);

      // Table data preparation
      const tableData = orders.map((order, index) => [
        (index + 1).toString(),
        order.order_number,
        order.customer_name,
        order.customer_phone,
        order.customer_address.length > 25 ? order.customer_address.substring(0, 25) + '...' : order.customer_address,
        `PKR ${order.total_amount.toLocaleString()}`,
        order.status.charAt(0).toUpperCase() + order.status.slice(1),
        new Date(order.created_at).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short'
        })
      ]);

      // Enhanced table with smaller, more readable styling
      autoTable(doc, {
        head: [['#', 'Order ID', 'Customer', 'Phone', 'Address', 'Amount', 'Status', 'Date']],
        body: tableData,
        startY: 75,
        theme: 'grid',
        headStyles: {
          fillColor: headerBgColor,
          textColor: textDark,
          fontStyle: 'bold',
          fontSize: 7,
          cellPadding: { top: 4, right: 2, bottom: 4, left: 2 },
          lineColor: borderColor,
          lineWidth: 0.3,
        },
        bodyStyles: {
          fontSize: 6,
          cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
          lineColor: borderColor,
          lineWidth: 0.2,
          textColor: textDark,
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' }, // #
          1: { cellWidth: 22, fontStyle: 'bold', fontSize: 6 }, // Order ID
          2: { cellWidth: 25, fontSize: 6 }, // Customer
          3: { cellWidth: 22, fontSize: 6 }, // Phone
          4: { cellWidth: 30, fontSize: 5 }, // Address
          5: { cellWidth: 20, halign: 'right', fontStyle: 'bold', fontSize: 6 }, // Amount
          6: { cellWidth: 18, halign: 'center', fontSize: 6 }, // Status
          7: { cellWidth: 15, halign: 'center', fontSize: 6 }, // Date
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252] // Very light gray
        },
        margin: { left: 15, right: 15 },
        didDrawCell: (data) => {
          // Add status badges with colors
          if (data.column.index === 6 && data.cell.section === 'body') {
            const status = data.cell.text[0].toLowerCase();
            let statusColor: [number, number, number];
            
            switch (status) {
              case 'pending':
                statusColor = [252, 211, 77]; // Yellow
                break;
              case 'processing':
                statusColor = [96, 165, 250]; // Blue
                break;
              case 'shipped':
                statusColor = [168, 85, 247]; // Purple
                break;
              case 'delivered':
                statusColor = [52, 211, 153]; // Green
                break;
              case 'cancelled':
                statusColor = [248, 113, 113]; // Red
                break;
              default:
                statusColor = [156, 163, 175]; // Gray
            }
            
            // Draw colored background for status
            doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.roundedRect(
              data.cell.x + 1, 
              data.cell.y + 1, 
              data.cell.width - 2, 
              data.cell.height - 2, 
              1, 1, 'F'
            );
            
            // Add status text with white color
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(5);
            doc.setFont('helvetica', 'bold');
            doc.text(
              data.cell.text[0], 
              data.cell.x + data.cell.width / 2, 
              data.cell.y + data.cell.height / 2 + 1, 
              { align: 'center' }
            );
          }
        }
      });

      // Footer with summary
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      if (finalY < pageHeight - 25) {
        // Summary box
        doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
        doc.roundedRect(15, finalY, pageWidth - 30, 20, 2, 2, 'F');
        
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(15, finalY, pageWidth - 30, 20, 2, 2, 'S');
        
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary', 20, finalY + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`Total Orders: ${orders.length}`, 20, finalY + 14);
        doc.text(`Total Revenue: PKR ${totalRevenue.toLocaleString()}`, 20, finalY + 18);
        
        // Average order value
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        doc.text(`Avg Order: PKR ${Math.round(avgOrderValue).toLocaleString()}`, pageWidth - 50, finalY + 14);
        
        // Order status distribution
        const statusCounts = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        let statusText = 'Status: ';
        Object.entries(statusCounts).forEach(([status, count], index) => {
          statusText += `${status}: ${count}`;
          if (index < Object.entries(statusCounts).length - 1) statusText += ', ';
        });
        doc.text(statusText, pageWidth - 50, finalY + 18);
      }

      // Page footer
      doc.setFontSize(6);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('A&Z Fabrics - This is a computer-generated document.', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Page numbering
      doc.text(`Page 1`, pageWidth - 15, pageHeight - 8);

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
