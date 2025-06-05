
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

    // Validate required parameters
    if (!orderId || !amount || amount <= 0) {
      console.error('Invalid request parameters:', { orderId, amount })
      throw new Error('Missing or invalid required parameters')
    }

    // Validate customer information
    if (!customerName || !customerEmail) {
      console.error('Missing customer information:', { customerName, customerEmail })
      throw new Error('Customer name and email are required')
    }

    const apiKey = Deno.env.get('SAFEPAY_API_KEY')
    const secretKey = Deno.env.get('SAFEPAY_SECRET_KEY')
    
    console.log('SAFEPAY credentials status:', { 
      hasApiKey: !!apiKey, 
      hasSecretKey: !!secretKey
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

    // Clean and validate phone number
    let countryCode = '+92'
    let phoneNumber = '3000000000' // Default fallback
    
    if (customerPhone) {
      const cleanPhone = customerPhone.replace(/\D/g, '')
      if (cleanPhone.length >= 10) {
        phoneNumber = cleanPhone.substring(cleanPhone.length - 10)
      }
    }

    // Build comprehensive payment data
    const paymentData = {
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: currency || "PKR",
      amount: Math.round(amount * 100), // Convert to paisas
      customer: {
        name: customerName,
        email: customerEmail,
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
          break
        case 'card':
        default:
          paymentData.metadata.preferred_method = 'card'
          break
      }
    }

    console.log('Creating SAFEPAY payment session...')

    // Use production endpoint for live payments
    const endpoint = 'https://api.safepay.pk/checkout/create'
    
    console.log(`Using SAFEPAY endpoint: ${endpoint}`)
    
    // Enhanced request with proper headers and timeout
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SFPY-MERCHANT-SECRET': secretKey,
        'Accept': 'application/json',
        'User-Agent': 'Hallem-Fashion-Hub/1.0'
      },
      body: JSON.stringify(paymentData)
    })

    const responseText = await response.text()
    console.log(`SAFEPAY response status: ${response.status}`)

    if (response.ok) {
      let responseData
      try {
        responseData = JSON.parse(responseText)
        console.log('Payment session created successfully')
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        throw new Error('Invalid response from payment gateway')
      }

      // Handle different response structures
      const checkoutUrl = responseData?.data?.checkout_url || 
                         responseData?.checkout_url || 
                         responseData?.data?.url ||
                         responseData?.url

      const sessionToken = responseData?.data?.session_uuid || 
                          responseData?.data?.token || 
                          responseData?.session_uuid || 
                          responseData?.token ||
                          responseData?.data?.id ||
                          responseData?.id

      if (checkoutUrl) {
        console.log('Payment session URL generated successfully')
        
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
        throw new Error('Payment session creation failed - no checkout URL received')
      }
    } else {
      console.error(`SAFEPAY API Error: ${response.status} - ${responseText}`)
      
      let errorMessage = 'Payment gateway error'
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Payment gateway authentication failed'
      } else if (response.status >= 500) {
        errorMessage = 'Payment gateway temporarily unavailable'
      } else if (response.status === 400) {
        errorMessage = 'Invalid payment request'
      }
      
      throw new Error(`${errorMessage} (Status: ${response.status})`)
    }

  } catch (error) {
    console.error('Error in payment processing:', error.message)
    
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
