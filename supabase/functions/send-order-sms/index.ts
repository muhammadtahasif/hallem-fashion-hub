
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  order: {
    order_number: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    customer_address: string;
    customer_city: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received SMS notification request");
    const { order }: SMSRequest = await req.json();
    console.log("Order data for SMS:", order);

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("Missing Twilio credentials");
      throw new Error("Twilio credentials not configured");
    }

    // Send SMS to admin
    const adminMessage = `🛍️ A&Z FABRICS - NEW ORDER ALERT!
    
Order: ${order.order_number}
Customer: ${order.customer_name}
Phone: ${order.customer_phone}
Amount: PKR ${order.total_amount.toLocaleString()}
Address: ${order.customer_address}, ${order.customer_city}

Please process this order ASAP!`;

    console.log("Sending SMS to admin with message:", adminMessage);

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioPhoneNumber,
        To: '+923086932240',
        Body: adminMessage,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twilio API error:", response.status, errorText);
      throw new Error(`Twilio API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("SMS sent successfully:", result);

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
