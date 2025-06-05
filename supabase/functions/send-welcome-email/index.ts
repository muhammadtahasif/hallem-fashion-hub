
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, confirmationUrl } = await req.json();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Hallem Fashion Hub</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0; 
              background-color: #f4f4f4; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 10px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            }
            .header { 
              background: linear-gradient(135deg, #e11d48, #f97316); 
              color: white; 
              padding: 40px 20px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold; 
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              color: #333; 
              margin-bottom: 20px; 
            }
            .btn { 
              display: inline-block; 
              background: linear-gradient(135deg, #e11d48, #f97316); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 50px; 
              font-weight: bold; 
              margin: 20px 0; 
              transition: transform 0.2s; 
            }
            .btn:hover { 
              transform: translateY(-2px); 
            }
            .footer { 
              background: #f8f9fa; 
              padding: 20px; 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
            }
            .feature { 
              display: flex; 
              align-items: center; 
              margin: 15px 0; 
              padding: 15px; 
              background: #f8f9fa; 
              border-radius: 8px; 
            }
            .feature-icon { 
              width: 40px; 
              height: 40px; 
              background: linear-gradient(135deg, #e11d48, #f97316); 
              border-radius: 50%; 
              margin-right: 15px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold; 
            }
            @media only screen and (max-width: 600px) {
              .container { margin: 10px; }
              .content { padding: 20px; }
              .header { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Welcome to Hallem Fashion Hub</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Where Style Meets Elegance</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name || 'Fashion Lover'}! 👋</h2>
              
              <p>Thank you for joining the Hallem Fashion Hub family! We're thrilled to have you as part of our community of fashion enthusiasts.</p>
              
              <p>To complete your registration and start exploring our exclusive collection, please confirm your email address by clicking the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" class="btn">🔐 Confirm Your Email</a>
              </div>
              
              <div style="margin: 30px 0;">
                <h3 style="color: #333; margin-bottom: 20px;">What awaits you:</h3>
                
                <div class="feature">
                  <div class="feature-icon">👗</div>
                  <div>
                    <strong>Exclusive Fashion Collection</strong><br>
                    <span style="color: #666;">Discover the latest trends and timeless pieces</span>
                  </div>
                </div>
                
                <div class="feature">
                  <div class="feature-icon">🛍️</div>
                  <div>
                    <strong>Seamless Shopping Experience</strong><br>
                    <span style="color: #666;">Easy browsing, secure payments, and fast delivery</span>
                  </div>
                </div>
                
                <div class="feature">
                  <div class="feature-icon">💎</div>
                  <div>
                    <strong>Member-Only Benefits</strong><br>
                    <span style="color: #666;">Special discounts, early access, and personalized recommendations</span>
                  </div>
                </div>
              </div>
              
              <p style="margin-top: 30px;">If you have any questions or need assistance, our customer support team is here to help. Welcome aboard!</p>
              
              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                <em>If you didn't create an account with us, please ignore this email.</em>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Hallem Fashion Hub</strong></p>
              <p>Your trusted destination for premium fashion</p>
              <p style="margin-top: 15px;">
                <a href="mailto:support@hallemfashion.com" style="color: #e11d48; text-decoration: none;">support@hallemfashion.com</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Hallem Fashion Hub <onboarding@resend.dev>",
      to: [email],
      subject: "✨ Welcome to Hallem Fashion Hub - Confirm Your Email",
      html: emailHtml,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
