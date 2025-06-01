
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  orderId: string
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  customerPhone: string
  description: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { orderId, amount, currency, customerEmail, customerName, customerPhone, description } = await req.json() as PaymentRequest

    // Get SAFEPAY credentials
    const apiKey = Deno.env.get('SAFEPAY_API_KEY')
    const secretKey = Deno.env.get('SAFEPAY_SECRET_KEY')

    if (!apiKey || !secretKey) {
      throw new Error('SAFEPAY credentials not configured')
    }

    // Create payment session with SAFEPAY
    const paymentData = {
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: currency || "PKR",
      amount: Math.round(amount * 100), // Convert to paisa (smallest unit)
      customer: {
        name: customerName,
        email: customerEmail,
        phone: {
          country_code: "+92",
          number: customerPhone.replace(/\D/g, '').slice(-10) // Extract last 10 digits
        }
      },
      success_url: `${req.headers.get('origin')}/checkout/success?order_id=${orderId}`,
      cancel_url: `${req.headers.get('origin')}/checkout/cancel?order_id=${orderId}`,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/safepay-webhook`,
      metadata: {
        order_id: orderId,
        description: description
      }
    }

    console.log('Creating SAFEPAY payment with data:', paymentData)

    // Make request to SAFEPAY API
    const safepayResponse = await fetch('https://sandbox.api.safepay.pk/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SFPY-MERCHANT-SECRET': secretKey,
      },
      body: JSON.stringify(paymentData)
    })

    const responseData = await safepayResponse.json()
    console.log('SAFEPAY response:', responseData)

    if (!safepayResponse.ok) {
      throw new Error(`SAFEPAY API error: ${responseData.message || 'Unknown error'}`)
    }

    // Update order with payment session info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'payment_pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: responseData.data.checkout_url,
        session_id: responseData.data.session_token
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
