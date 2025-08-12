import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // リクエストボディを取得
    const { priceId, userId } = await req.json()

    if (!priceId || !userId) {
      throw new Error('Price ID and User ID are required')
    }

    // Supabaseクライアント作成
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError || !userData.user) {
      throw new Error('User not found')
    }

    const email = userData.user.email

    // 既存のStripe顧客を検索、なければ作成
    let customerId: string
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          supabase_user_id: userId,
        },
      })
      customerId = customer.id
    }

    // Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard?payment=cancelled`,
      metadata: {
        user_id: userId,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
      locale: 'ja',
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
    })

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        details: error 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})