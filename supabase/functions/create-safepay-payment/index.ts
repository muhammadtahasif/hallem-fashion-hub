
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    console.log('Payment request received:', { orderId, amount, currency, customerEmail, customerName, customerPhone })

    if (!orderId || !amount) {
      throw new Error('Missing required parameters: orderId and amount')
    }

    const apiKey = Deno.env.get('SAFEPAY_API_KEY')
    const secretKey = Deno.env.get('SAFEPAY_SECRET_KEY')
    
    console.log('SAFEPAY credentials status:', { 
      hasApiKey: !!apiKey, 
      hasSecretKey: !!secretKey,
      apiKeyPrefix: apiKey?.substring(0, 8) + '...',
      secretKeyPrefix: secretKey?.substring(0, 8) + '...'
    })
    
    if (!apiKey || !secretKey) {
      console.error('SAFEPAY credentials missing')
      return new Response(
        JSON.stringify({
          success: true,
          fallback_to_cod: true,
          message: "Payment gateway credentials not configured. Processing as Cash on Delivery."
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Clean phone number
    const phoneMatch = customerPhone?.match(/^(\+\d{1,3})\s*(.+)/)
    const countryCode = phoneMatch ? phoneMatch[1] : '+92'
    const phoneNumber = phoneMatch ? phoneMatch[2].replace(/\D/g, '') : customerPhone?.replace(/\D/g, '') || ''

    const paymentData = {
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: currency || "PKR",
      amount: Math.round(amount * 100),
      customer: {
        name: customerName || "Customer",
        email: customerEmail || "customer@example.com",
        phone: {
          country_code: countryCode,
          number: phoneNumber
        }
      },
      success_url: `${req.headers.get('origin') || 'https://preview--hallem-fashion-hub.lovable.app'}/checkout/success?order_id=${orderId}`,
      cancel_url: `${req.headers.get('origin') || 'https://preview--hallem-fashion-hub.lovable.app'}/checkout/cancel?order_id=${orderId}`,
      webhook_url: `https://jrnotkitoiiwikswpmdt.supabase.co/functions/v1/safepay-webhook`,
      metadata: {
        order_id: orderId,
        description: description || `Order ${orderId}`
      }
    }

    console.log('Creating SAFEPAY payment session with data:', JSON.stringify(paymentData, null, 2))

    // Try multiple endpoints with better error handling
    const endpoints = [
      'https://api.safepay.pk/checkout/create',
      'https://gw.safepay.pk/checkout/create',
      'https://sandbox.api.safepay.pk/checkout/create'
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`Attempting SAFEPAY endpoint: ${endpoint}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log(`Timeout reached for ${endpoint}`)
          controller.abort()
        }, 20000) // 20 second timeout

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SFPY-MERCHANT-SECRET': secretKey,
            'Accept': 'application/json',
            'User-Agent': 'Lovable-AZ-Fabrics/1.0'
          },
          body: JSON.stringify(paymentData),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        const responseText = await response.text()
        console.log(`SAFEPAY response from ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          bodyLength: responseText.length,
          body: responseText
        })

        if (response.ok) {
          let responseData
          try {
            responseData = JSON.parse(responseText)
          } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError)
            continue
          }

          if (responseData?.data?.checkout_url || responseData?.checkout_url) {
            const checkoutUrl = responseData.data?.checkout_url || responseData.checkout_url
            const sessionToken = responseData.data?.session_uuid || responseData.data?.token || responseData.session_uuid || responseData.token
            
            console.log('SAFEPAY payment session created successfully:', { checkoutUrl, sessionToken })
            
            return new Response(
              JSON.stringify({
                success: true,
                checkout_url: checkoutUrl,
                session_token: sessionToken
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              }
            )
          } else {
            console.error('Checkout URL not found in response:', responseData)
            continue
          }
        } else {
          console.error(`SAFEPAY API Error from ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            body: responseText
          })
          
          // If it's a 4xx error, it might be credential or data issues
          if (response.status >= 400 && response.status < 500) {
            break // Don't try other endpoints for client errors
          }
          continue
        }

      } catch (fetchError) {
        console.error(`Network error with ${endpoint}:`, {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack
        })
        
        if (fetchError.name === 'AbortError') {
          console.log(`Request to ${endpoint} was aborted due to timeout`)
        }
        continue
      }
    }

    // All endpoints failed - provide fallback
    console.error('All SAFEPAY endpoints failed, falling back to COD')
    return new Response(
      JSON.stringify({
        success: true,
        fallback_to_cod: true,
        message: "Online payment is temporarily unavailable. Your order will be processed as Cash on Delivery."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Critical error in payment processing:', error)
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
