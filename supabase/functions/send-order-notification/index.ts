
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
    const { order }: OrderNotificationRequest = await req.json();

    // Send email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "AL-HALLEM <orders@al-hallem.com>",
      to: [order.customer_email],
      subject: `Order Confirmation - ${order.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e11d48;">Thank you for your order!</h1>
          <p>Dear ${order.customer_name},</p>
          <p>We have received your order and it's being processed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Total Amount:</strong> PKR ${order.total_amount.toLocaleString()}</p>
            <p><strong>Delivery Address:</strong> ${order.customer_address}, ${order.customer_city}</p>
          </div>

          <h3>Items Ordered:</h3>
          <ul>
            ${order.items.map(item => `
              <li>${item.product_name} - Quantity: ${item.quantity} - PKR ${(item.product_price * item.quantity).toLocaleString()}</li>
            `).join('')}
          </ul>

          <p>We'll contact you soon to confirm your order details.</p>
          <p>Best regards,<br>AL-HALLEM Team</p>
        </div>
      `,
    });

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "AL-HALLEM Orders <orders@al-hallem.com>",
      to: ["digitaleyemedia25@gmail.com"],
      subject: `New Order Received - ${order.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e11d48;">New Order Received!</h1>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Customer Details:</h3>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            <p><strong>Address:</strong> ${order.customer_address}, ${order.customer_city}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Total Amount:</strong> PKR ${order.total_amount.toLocaleString()}</p>
          </div>

          <h3>Items Ordered:</h3>
          <ul>
            ${order.items.map(item => `
              <li>${item.product_name} - Quantity: ${item.quantity} - PKR ${(item.product_price * item.quantity).toLocaleString()}</li>
            `).join('')}
          </ul>

          <p>Please process this order as soon as possible.</p>
        </div>
      `,
    });

    console.log("Order notification emails sent:", { customerEmailResponse, adminEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
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
