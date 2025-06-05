
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
      description,
      paymentDetails
    } = await req.json()

    console.log('Payment request received:', { 
      orderId, 
      amount, 
      currency, 
      customerEmail, 
      customerName, 
      customerPhone,
      paymentType: paymentDetails?.paymentType
    })

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
          success: false,
          error: "Payment gateway configuration missing. Please contact support.",
          fallback_to_cod: true
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

    // Build payment data based on payment type
    let paymentData = {
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
        description: description || `Order ${orderId}`,
        payment_type: paymentDetails?.paymentType || 'card'
      }
    }

    // Add payment method specific configurations
    if (paymentDetails?.paymentType) {
      switch (paymentDetails.paymentType) {
        case 'jazzcash':
          paymentData.metadata.preferred_method = 'jazzcash'
          break
        case 'easypaisa':
          paymentData.metadata.preferred_method = 'easypaisa'
          break
        case 'bank':
          paymentData.metadata.preferred_method = 'bank_transfer'
          paymentData.metadata.bank_name = paymentDetails.bankName
          break
        case 'card':
        default:
          paymentData.metadata.preferred_method = 'card'
          break
      }
    }

    console.log('Creating SAFEPAY payment session with data:', JSON.stringify(paymentData, null, 2))

    // Use sandbox endpoint
    const endpoint = 'https://sandbox.api.safepay.pk/checkout/create'
    
    console.log(`Using SAFEPAY sandbox endpoint: ${endpoint}`)
    
    // Add retry logic
    let response
    let lastError
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Payment attempt ${attempt}/3`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log(`Timeout reached for attempt ${attempt}`)
          controller.abort()
        }, 15000) // 15 second timeout per attempt

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SFPY-MERCHANT-SECRET': secretKey,
            'Accept': 'application/json',
            'User-Agent': 'Hallem-Fashion-Hub/1.0'
          },
          body: JSON.stringify(paymentData),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        break // Success, exit retry loop
        
      } catch (fetchError) {
        lastError = fetchError
        console.error(`Attempt ${attempt} failed:`, fetchError)
        
        if (attempt === 3) {
          throw new Error(`Payment gateway connection failed after 3 attempts: ${lastError.message}`)
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }

    if (!response) {
      throw new Error('Failed to get response from payment gateway')
    }

    const responseText = await response.text()
    console.log(`SAFEPAY response:`, {
      status: response.status,
      statusText: response.statusText,
      bodyLength: responseText.length,
      body: responseText.substring(0, 1000)
    })

    if (response.ok) {
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        throw new Error('Invalid response format from payment gateway')
      }

      if (responseData?.data?.checkout_url || responseData?.checkout_url) {
        const checkoutUrl = responseData.data?.checkout_url || responseData.checkout_url
        const sessionToken = responseData.data?.session_uuid || responseData.data?.token || responseData.session_uuid || responseData.token
        
        console.log('SAFEPAY payment session created successfully:', { checkoutUrl, sessionToken })
        
        return new Response(
          JSON.stringify({
            success: true,
            checkout_url: checkoutUrl,
            session_token: sessionToken,
            payment_type: paymentDetails?.paymentType || 'card'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } else {
        console.error('Checkout URL not found in response:', responseData)
        throw new Error('Payment session creation failed - invalid response structure')
      }
    } else {
      console.error(`SAFEPAY API Error:`, {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      })
      
      // Return specific error based on status code
      let errorMessage = 'Payment gateway error'
      if (response.status === 401) {
        errorMessage = 'Payment gateway authentication failed - please check credentials'
      } else if (response.status >= 500) {
        errorMessage = 'Payment gateway server temporarily unavailable'
      } else if (response.status === 400) {
        errorMessage = 'Invalid payment request - please check details'
      }
      
      throw new Error(`${errorMessage} (Status: ${response.status})`)
    }

  } catch (error) {
    console.error('Error in payment processing:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment processing failed',
        fallback_to_cod: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
})
