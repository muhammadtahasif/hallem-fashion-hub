
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received contact form submission");
    const { name, email, phone, subject, message }: ContactEmailRequest = await req.json();
    console.log("Contact form data:", { name, email, phone, subject });

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "A&Z Fabrics Contact <orders@al-hallem.com>",
      to: ["digitaleyemedia25@gmail.com"],
      subject: `📧 New Contact Form Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e11d48; font-size: 28px; margin: 0;">A&Z Fabrics</h1>
            <p style="color: #666; margin: 5px 0;">New Contact Form Message</p>
          </div>
          
          <div style="background: #e11d48; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px;">📧 New Message Received!</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #e11d48;">
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Action Required:</strong> Please respond to this customer inquiry as soon as possible.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; margin: 0;">Reply directly to: <a href="mailto:${email}" style="color: #e11d48;">${email}</a></p>
          </div>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "A&Z Fabrics <orders@al-hallem.com>",
      to: [email],
      subject: "Thank you for contacting A&Z Fabrics",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e11d48; font-size: 28px; margin: 0;">A&Z Fabrics</h1>
            <p style="color: #666; margin: 5px 0;">Premium Fashion Collection</p>
          </div>
          
          <h2 style="color: #333; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">Thank you for your message!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you as soon as possible.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message Summary:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a2d;"><strong>✅ What's Next:</strong> We typically respond to all inquiries within 24 hours during business days.</p>
          </div>

          <div style="border-top: 2px solid #e11d48; padding-top: 20px; margin-top: 30px;">
            <p>If you have any urgent questions, feel free to call us at <strong>+92 3090449955</strong>.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>A&Z Fabrics Team</strong></p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">📞 +92 3090449955 | ✉️ digitaleyemedia25@gmail.com | 🏪 Pakistan</p>
          </div>
        </div>
      `,
    });

    console.log("Customer confirmation email sent:", customerEmailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      adminEmailId: adminEmailResponse.data?.id,
      customerEmailId: customerEmailResponse.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending contact form email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
