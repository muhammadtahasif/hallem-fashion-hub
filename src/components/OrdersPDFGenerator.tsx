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

      // Header section with improved design
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('A&Z FABRICS', 15, 22);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Premium Fashion Collection', 15, 30);
      
      // Contact info in header
      doc.setFontSize(9);
      const contactY = 22;
      doc.text('📞 +923234882256', pageWidth - 55, contactY);
      doc.text('✉️ digitaleyemedia25@gmail.com', pageWidth - 55, contactY + 6);

      // Report title with styling
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, 50);
      
      // Date and summary info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated on: ${currentDate}`, 15, 58);
      doc.text(`Total Orders: ${orders.length}`, 15, 66);
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      doc.text(`Total Revenue: PKR ${totalRevenue.toLocaleString()}`, 15, 74);

      // Decorative line
      doc.setLineWidth(0.5);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.line(15, 80, pageWidth - 15, 80);

      // Table data preparation
      const tableData = orders.map((order, index) => [
        (index + 1).toString(),
        order.order_number,
        order.customer_name,
        order.customer_phone,
        `PKR ${order.total_amount.toLocaleString()}`,
        order.status.charAt(0).toUpperCase() + order.status.slice(1),
        new Date(order.created_at).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      ]);

      // Enhanced table with professional styling
      autoTable(doc, {
        head: [['#', 'Order ID', 'Customer', 'Phone', 'Amount', 'Status', 'Date']],
        body: tableData,
        startY: 88,
        theme: 'grid',
        headStyles: {
          fillColor: headerBgColor,
          textColor: textDark,
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: { top: 8, right: 5, bottom: 8, left: 5 },
          lineColor: borderColor,
          lineWidth: 0.5,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: { top: 6, right: 5, bottom: 6, left: 5 },
          lineColor: borderColor,
          lineWidth: 0.3,
          textColor: textDark,
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' }, // #
          1: { cellWidth: 35, fontStyle: 'bold' }, // Order ID
          2: { cellWidth: 40 }, // Customer
          3: { cellWidth: 35 }, // Phone
          4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }, // Amount
          5: { cellWidth: 25, halign: 'center' }, // Status
          6: { cellWidth: 28, halign: 'center' }, // Date
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252] // Very light gray
        },
        margin: { left: 15, right: 15 },
        didDrawCell: (data) => {
          // Add status badges with colors
          if (data.column.index === 5 && data.cell.section === 'body') {
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
              data.cell.x + 2, 
              data.cell.y + 2, 
              data.cell.width - 4, 
              data.cell.height - 4, 
              2, 2, 'F'
            );
            
            // Add status text with white color
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
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

      // Footer with enhanced design
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      if (finalY < pageHeight - 30) {
        // Summary box
        doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
        doc.roundedRect(15, finalY, pageWidth - 30, 25, 3, 3, 'F');
        
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, finalY, pageWidth - 30, 25, 3, 3, 'S');
        
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary', 20, finalY + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Total Orders: ${orders.length}`, 20, finalY + 16);
        doc.text(`Total Revenue: PKR ${totalRevenue.toLocaleString()}`, 20, finalY + 22);
        
        // Average order value
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        doc.text(`Average Order Value: PKR ${Math.round(avgOrderValue).toLocaleString()}`, pageWidth - 80, finalY + 16);
        
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
        doc.text(statusText, pageWidth - 80, finalY + 22);
      }

      // Page footer
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('A&Z Fabrics - Premium Fashion Collection', pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text('This is a computer-generated document.', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Page numbering
      doc.text(`Page 1 of 1`, pageWidth - 20, pageHeight - 10);

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
