
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
    const { 
      orderId, 
      amount, 
      currency, 
      customerEmail, 
      customerName, 
      customerPhone, 
      description 
    } = await req.json()

    console.log('Received payment request:', { orderId, amount, currency, customerEmail, customerName, customerPhone, description })

    if (!orderId || !amount) {
      throw new Error('Missing required parameters: orderId and amount')
    }

    // Get SAFEPAY credentials
    const apiKey = Deno.env.get('SAFEPAY_API_KEY')
    const secretKey = Deno.env.get('SAFEPAY_SECRET_KEY')
    
    if (!apiKey || !secretKey) {
      console.error('SAFEPAY credentials not found')
      // Return COD fallback
      return new Response(
        JSON.stringify({
          success: true,
          fallback_to_cod: true,
          message: "Online payment service is temporarily unavailable. Your order will be processed as Cash on Delivery."
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Parse phone number to extract country code and number
    const phoneMatch = customerPhone?.match(/^(\+\d{1,3})\s*(.+)/)
    const countryCode = phoneMatch ? phoneMatch[1] : '+92'
    const phoneNumber = phoneMatch ? phoneMatch[2].replace(/\s/g, '') : customerPhone?.replace(/\s/g, '') || ''

    const paymentData = {
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: currency || "PKR",
      amount: Math.round(amount * 100), // Convert to paisa/cents
      customer: {
        name: customerName || "Customer",
        email: customerEmail || "customer@example.com",
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
        description: description || `Order ${orderId}`
      }
    }

    console.log('Creating SAFEPAY payment with data:', JSON.stringify(paymentData, null, 2))

    // Create payment session with SAFEPAY
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch('https://gw.sandbox.safepay.pk/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-MERCHANT-SECRET': secretKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const responseText = await response.text()
      console.log('SAFEPAY raw response:', responseText)
      console.log('SAFEPAY response status:', response.status)

      if (!response.ok) {
        console.error('SAFEPAY API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        })
        
        // Return a COD fallback instead of error
        return new Response(
          JSON.stringify({
            success: true,
            fallback_to_cod: true,
            message: "Online payment gateway is currently experiencing issues. Your order will be processed as Cash on Delivery."
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse SAFEPAY response:', parseError)
        // Return COD fallback
        return new Response(
          JSON.stringify({
            success: true,
            fallback_to_cod: true,
            message: "Payment service response error. Your order will be processed as Cash on Delivery."
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      console.log('SAFEPAY parsed response:', JSON.stringify(responseData, null, 2))

      if (responseData.data?.checkout_url) {
        return new Response(
          JSON.stringify({
            success: true,
            checkout_url: responseData.data.checkout_url,
            session_token: responseData.data.session_uuid || responseData.data.token
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } else {
        console.error('Invalid SAFEPAY response structure:', responseData)
        // Return COD fallback
        return new Response(
          JSON.stringify({
            success: true,
            fallback_to_cod: true,
            message: "Payment gateway configuration error. Your order will be processed as Cash on Delivery."
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('Network error connecting to SAFEPAY:', fetchError)
      
      // Return COD fallback for network errors
      return new Response(
        JSON.stringify({
          success: true,
          fallback_to_cod: true,
          message: "Unable to connect to payment gateway. Your order will be processed as Cash on Delivery."
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

  } catch (error) {
    console.error('Error creating SAFEPAY payment:', error)
    // Return COD fallback instead of error
    return new Response(
      JSON.stringify({
        success: true,
        fallback_to_cod: true,
        message: "Payment service is temporarily unavailable. Your order will be processed as Cash on Delivery."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
})
