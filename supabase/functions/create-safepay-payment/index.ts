
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
    
    console.log('SAFEPAY credentials check:', { 
      hasApiKey: !!apiKey, 
      hasSecretKey: !!secretKey,
      apiKeyLength: apiKey?.length || 0,
      secretKeyLength: secretKey?.length || 0
    })
    
    if (!apiKey || !secretKey) {
      console.error('SAFEPAY credentials not found in environment')
      return new Response(
        JSON.stringify({
          success: true,
          fallback_to_cod: true,
          message: "Payment gateway credentials not configured. Your order will be processed as Cash on Delivery."
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

    // Try production endpoint first, then fallback to sandbox
    const endpoints = [
      'https://api.safepay.pk/checkout/create',
      'https://gw.safepay.pk/checkout/create',
      'https://sandbox.api.safepay.pk/checkout/create',
      'https://gw.sandbox.safepay.pk/checkout/create'
    ]

    let lastError = null
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying SAFEPAY endpoint: ${endpoint}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log(`Request timeout for ${endpoint} - aborting`)
          controller.abort()
        }, 15000) // 15 second timeout per endpoint

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SFPY-MERCHANT-SECRET': secretKey,
            'Accept': 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0'
          },
          body: JSON.stringify(paymentData),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        const responseText = await response.text()
        console.log(`SAFEPAY response from ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          bodyLength: responseText.length,
          bodyPreview: responseText.substring(0, 200)
        })

        if (response.ok) {
          let responseData
          try {
            responseData = JSON.parse(responseText)
            console.log('SAFEPAY parsed response:', JSON.stringify(responseData, null, 2))
          } catch (parseError) {
            console.error('Failed to parse SAFEPAY response as JSON:', parseError)
            continue // Try next endpoint
          }

          if (responseData.data?.checkout_url) {
            console.log('SAFEPAY payment session created successfully')
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
          }
        } else {
          console.error(`SAFEPAY API Error from ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            body: responseText
          })
          lastError = `${endpoint}: ${response.status} ${response.statusText}`
        }

      } catch (fetchError) {
        console.error(`Network error with ${endpoint}:`, fetchError)
        lastError = `${endpoint}: ${fetchError.message}`
        
        if (fetchError.name === 'AbortError') {
          console.log(`Request to ${endpoint} timed out`)
        }
        continue // Try next endpoint
      }
    }

    // If all endpoints failed
    console.error('All SAFEPAY endpoints failed. Last error:', lastError)
    return new Response(
      JSON.stringify({
        success: true,
        fallback_to_cod: true,
        message: "Payment gateway is currently unavailable. Your order will be processed as Cash on Delivery."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating SAFEPAY payment:', error)
    return new Response(
      JSON.stringify({
        success: true,
        fallback_to_cod: true,
        message: "Payment service encountered an error. Your order will be processed as Cash on Delivery."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
})
