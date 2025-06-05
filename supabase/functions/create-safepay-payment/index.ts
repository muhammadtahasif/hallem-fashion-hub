
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
      throw new Error('Missing or invalid required parameters: orderId and amount must be provided and amount must be greater than 0')
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

    // Clean and validate phone number
    let countryCode = '+92'
    let phoneNumber = ''
    
    if (customerPhone) {
      const phoneMatch = customerPhone.match(/^(\+\d{1,3})\s*(.+)/)
      countryCode = phoneMatch ? phoneMatch[1] : '+92'
      phoneNumber = phoneMatch ? phoneMatch[2].replace(/\D/g, '') : customerPhone.replace(/\D/g, '')
      
      // Ensure phone number has at least 10 digits
      if (phoneNumber.length < 10) {
        phoneNumber = '0000000000'
      }
    } else {
      phoneNumber = '0000000000'
    }

    // Build payment data based on payment type
    let paymentData = {
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
          if (paymentDetails.bankName) {
            paymentData.metadata.bank_name = paymentDetails.bankName
          }
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
    
    // Enhanced retry logic with better error handling
    let response
    let lastError
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Payment attempt ${attempt}/${maxRetries}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log(`Request timeout reached for attempt ${attempt}`)
          controller.abort()
        }, 30000) // 30 second timeout per attempt

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
        console.log(`Attempt ${attempt} completed with status: ${response.status}`)
        break // Success, exit retry loop
        
      } catch (fetchError) {
        lastError = fetchError
        console.error(`Attempt ${attempt} failed:`, {
          error: fetchError.message,
          name: fetchError.name,
          stack: fetchError.stack
        })
        
        if (attempt === maxRetries) {
          console.error(`All ${maxRetries} attempts failed. Last error:`, lastError)
          throw new Error(`Payment gateway connection failed after ${maxRetries} attempts: ${lastError.message}`)
        }
        
        // Exponential backoff: wait longer between retries
        const waitTime = 1000 * Math.pow(2, attempt - 1) // 1s, 2s, 4s
        console.log(`Waiting ${waitTime}ms before retry ${attempt + 1}`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    if (!response) {
      throw new Error('Failed to get response from payment gateway after all retries')
    }

    const responseText = await response.text()
    console.log(`SAFEPAY response:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      bodyLength: responseText.length,
      body: responseText.substring(0, 2000) // Log more of the response for debugging
    })

    if (response.ok) {
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        console.error('Raw response:', responseText)
        throw new Error('Invalid JSON response from payment gateway')
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
        console.log('SAFEPAY payment session created successfully:', { 
          checkoutUrl, 
          sessionToken,
          paymentType: paymentDetails?.paymentType || 'card'
        })
        
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
        throw new Error('Payment session creation failed - checkout URL not found in response')
      }
    } else {
      console.error(`SAFEPAY API Error:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      })
      
      // Parse error response if possible
      let errorDetails = responseText
      try {
        const errorData = JSON.parse(responseText)
        errorDetails = errorData.message || errorData.error || responseText
      } catch (e) {
        // Use raw response text if not JSON
      }
      
      // Return specific error based on status code
      let errorMessage = 'Payment gateway error'
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Payment gateway authentication failed - please check credentials'
      } else if (response.status >= 500) {
        errorMessage = 'Payment gateway server temporarily unavailable'
      } else if (response.status === 400) {
        errorMessage = `Invalid payment request: ${errorDetails}`
      } else if (response.status === 422) {
        errorMessage = `Payment validation failed: ${errorDetails}`
      }
      
      throw new Error(`${errorMessage} (Status: ${response.status})`)
    }

  } catch (error) {
    console.error('Error in payment processing:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Determine if this is a temporary error that should allow COD fallback
    const isTemporaryError = error.message.includes('connection failed') || 
                            error.message.includes('timeout') ||
                            error.message.includes('server temporarily unavailable') ||
                            error.message.includes('network')

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment processing failed',
        fallback_to_cod: isTemporaryError,
        error_type: isTemporaryError ? 'temporary' : 'permanent'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to avoid browser errors, handle error in frontend
      }
    )
  }
})
