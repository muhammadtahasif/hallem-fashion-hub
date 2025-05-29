
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    total_amount: number;
    items: any[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received order notification request");
    const { order }: OrderNotificationRequest = await req.json();
    console.log("Order data:", order);

    // Send email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "A&Z Fabrics <orders@al-hallem.com>",
      to: [order.customer_email],
      subject: `Order Confirmation - ${order.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e11d48; font-size: 28px; margin: 0;">A&Z Fabrics</h1>
            <p style="color: #666; margin: 5px 0;">Premium Fashion Collection</p>
          </div>
          
          <h2 style="color: #333; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">Thank you for your order!</h2>
          <p>Dear ${order.customer_name},</p>
          <p>We have received your order and it's being processed. You will receive another email once your order has been shipped.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Total Amount:</strong> PKR ${order.total_amount.toLocaleString()}</p>
            <p><strong>Delivery Address:</strong> ${order.customer_address}, ${order.customer_city}</p>
          </div>

          <h3 style="color: #333;">Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Product</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Quantity</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd;">${item.product_name}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">PKR ${(item.product_price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="border-top: 2px solid #e11d48; padding-top: 20px; margin-top: 30px;">
            <p>We'll contact you soon to confirm your order details and provide tracking information.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>A&Z Fabrics Team</strong></p>
          </div>
        </div>
      `,
    });

    console.log("Customer email sent:", customerEmailResponse);

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "A&Z Fabrics Orders <orders@al-hallem.com>",
      to: ["digitaleyemedia25@gmail.com"],
      subject: `🛍️ New Order Received - ${order.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e11d48; font-size: 28px; margin: 0;">A&Z Fabrics</h1>
            <p style="color: #666; margin: 5px 0;">New Order Alert</p>
          </div>
          
          <div style="background: #e11d48; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px;">🎉 New Order Received!</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Customer Details:</h3>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            <p><strong>Address:</strong> ${order.customer_address}, ${order.customer_city}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Total Amount:</strong> PKR ${order.total_amount.toLocaleString()}</p>
          </div>

          <h3 style="color: #333;">Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background: #e11d48; color: white;">
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: center;">Quantity</th>
                <th style="padding: 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 12px;">${item.product_name}</td>
                  <td style="padding: 12px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right;">PKR ${(item.product_price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Action Required:</strong> Please process this order as soon as possible and update the customer with tracking information.</p>
          </div>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      customerEmailId: customerEmailResponse.data?.id,
      adminEmailId: adminEmailResponse.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending order notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
