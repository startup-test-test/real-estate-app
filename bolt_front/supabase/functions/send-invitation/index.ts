import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { invitationId, email, inviterName, propertyName, invitationUrl, role, userType } = await req.json()

    // Resend APIキーを環境変数から取得
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not found')
    }

    // メール内容を作成
    const roleLabels = {
      viewer: '閲覧のみ',
      commenter: 'コメント可能',
      editor: '編集可能'
    }

    const userTypeLabels = {
      family: '家族',
      tax_accountant: '税理士',
      consultant: '不動産専門家',
      general: 'ゲスト'
    }

    const emailContent = {
      from: 'noreply@yourdomain.com', // 実際のドメインに変更
      to: email,
      subject: `【不動産投資シミュレーター】${propertyName}の投資検討にご招待`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🏡 不動産投資の検討にご招待</h2>
          
          <p><strong>${inviterName}</strong>さんから、不動産投資シミュレーションの検討にご招待いただきました。</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">📋 招待詳細</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>物件名:</strong> ${propertyName}</li>
              <li><strong>あなたの役割:</strong> ${userTypeLabels[userType] || userType}</li>
              <li><strong>権限:</strong> ${roleLabels[role] || role}</li>
            </ul>
          </div>
          
          <p>シミュレーション結果を確認し、コメントで投資判断についてご相談いただけます。</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              📊 シミュレーション結果を確認する
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <div style="font-size: 14px; color: #6B7280;">
            <p><strong>💡 ヒント:</strong></p>
            <ul>
              <li>コメントでご意見や質問を投稿できます</li>
              <li>👍👎❓ でリアクションも可能です</li>
              <li>#要検討 #リスク などのタグも使えます</li>
            </ul>
            
            <p style="margin-top: 20px;">
              <small>このリンクは7日間有効です。<br>
              本メールに心当たりがない場合は、無視してください。</small>
            </p>
          </div>
        </div>
      `
    }

    // Resend APIでメール送信
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Email sending failed: ${result.message}`)
    }

    // 送信成功をSupabaseに記録
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    await supabase
      .from('share_invitations')
      .update({ 
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully',
        emailId: result.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending invitation email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})