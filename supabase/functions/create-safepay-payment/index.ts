
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, amount, currency, customerEmail, customerName, customerPhone, description } = await req.json()

    if (!orderId || !amount) {
      throw new Error('Missing required parameters')
    }

    // Get SAFEPAY credentials
    const apiKey = Deno.env.get('SAFEPAY_API_KEY')
    const secretKey = Deno.env.get('SAFEPAY_SECRET_KEY')
    
    if (!apiKey || !secretKey) {
      throw new Error('SAFEPAY credentials not configured')
    }

    // Parse phone number to extract country code and number
    const phoneMatch = customerPhone.match(/^(\+\d{1,3})\s*(.+)/)
    const countryCode = phoneMatch ? phoneMatch[1] : '+92'
    const phoneNumber = phoneMatch ? phoneMatch[2].replace(/\s/g, '') : customerPhone.replace(/\s/g, '')

    const paymentData = {
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: currency,
      amount: amount * 100, // Convert to paisa/cents
      customer: {
        name: customerName,
        email: customerEmail,
        phone: {
          country_code: countryCode,
          number: phoneNumber
        }
      },
      success_url: `https://preview--hallem-fashion-hub.lovable.app/checkout/success?order_id=${orderId}`,
      cancel_url: `https://preview--hallem-fashion-hub.lovable.app/checkout/cancel?order_id=${orderId}`,
      webhook_url: `https://jrnotkitoiiwikswpmdt.supabase.co/functions/v1/safepay-webhook`,
      metadata: {
        order_id: orderId,
        description: description
      }
    }

    console.log('Creating SAFEPAY payment with data:', paymentData)

    // Create payment session with SAFEPAY
    const response = await fetch('https://sandbox.api.safepay.pk/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SFPY-MERCHANT-SECRET': secretKey,
      },
      body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SAFEPAY API Error:', errorText)
      throw new Error(`SAFEPAY API Error: ${response.status} - ${errorText}`)
    }

    const responseData = await response.json()
    console.log('SAFEPAY response:', responseData)

    if (responseData.data?.checkout_url) {
      return new Response(
        JSON.stringify({
          success: true,
          checkout_url: responseData.data.checkout_url,
          session_token: responseData.data.session_uuid
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      throw new Error('Invalid response from SAFEPAY')
    }

  } catch (error) {
    console.error('Error creating SAFEPAY payment:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
