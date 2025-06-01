
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SafepayWebhook {
  event: string
  data: {
    session_uuid: string
    metadata: {
      order_id: string
    }
    state: string
    amount: number
    currency: string
  }
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

    const webhookData = await req.json() as SafepayWebhook
    console.log('SAFEPAY webhook received:', webhookData)

    const { event, data } = webhookData
    const orderId = data.metadata?.order_id

    if (!orderId) {
      console.error('No order ID in webhook data')
      return new Response('No order ID', { status: 400 })
    }

    let orderStatus = 'pending'
    let shouldSendNotification = false

    // Handle different webhook events
    switch (event) {
      case 'payment.succeeded':
        orderStatus = 'confirmed'
        shouldSendNotification = true
        console.log(`Payment succeeded for order ${orderId}`)
        break
      case 'payment.failed':
        orderStatus = 'payment_failed'
        console.log(`Payment failed for order ${orderId}`)
        break
      case 'payment.cancelled':
        orderStatus = 'cancelled'
        console.log(`Payment cancelled for order ${orderId}`)
        break
      default:
        console.log(`Unhandled webhook event: ${event}`)
        return new Response('Event not handled', { status: 200 })
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
      return new Response('Database error', { status: 500 })
    }

    // Send notifications for successful payments
    if (shouldSendNotification) {
      // Get order details for notifications
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            product_price
          )
        `)
        .eq('id', orderId)
        .single()

      if (!orderError && order) {
        // Send email notification
        EdgeRuntime.waitUntil(
          supabase.functions.invoke('send-order-notification', {
            body: { order }
          })
        )

        // Send SMS notification
        EdgeRuntime.waitUntil(
          supabase.functions.invoke('send-order-sms', {
            body: { order }
          })
        )
      }
    }

    return new Response('Webhook processed', { 
      headers: corsHeaders,
      status: 200 
    })

  } catch (error) {
    console.error('Error processing SAFEPAY webhook:', error)
    return new Response('Webhook error', { status: 500 })
  }
})
