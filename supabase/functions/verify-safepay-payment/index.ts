
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { sessionToken, orderId } = await req.json()

    if (!sessionToken || !orderId) {
      throw new Error('Missing required parameters')
    }

    // Get SAFEPAY credentials
    const secretKey = Deno.env.get('SAFEPAY_SECRET_KEY')
    if (!secretKey) {
      throw new Error('SAFEPAY credentials not configured')
    }

    // Verify payment with SAFEPAY
    const verifyResponse = await fetch(`https://sandbox.api.safepay.pk/checkout/${sessionToken}`, {
      method: 'GET',
      headers: {
        'X-SFPY-MERCHANT-SECRET': secretKey,
      }
    })

    const verifyData = await verifyResponse.json()
    console.log('SAFEPAY verification response:', verifyData)

    if (!verifyResponse.ok) {
      throw new Error('Payment verification failed')
    }

    const paymentState = verifyData.data?.state
    let orderStatus = 'pending'

    switch (paymentState) {
      case 'captured':
      case 'completed':
        orderStatus = 'confirmed'
        break
      case 'failed':
        orderStatus = 'payment_failed'
        break
      case 'cancelled':
        orderStatus = 'cancelled'
        break
      default:
        orderStatus = 'payment_pending'
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_status: paymentState,
        order_status: orderStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error verifying payment:', error)
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
