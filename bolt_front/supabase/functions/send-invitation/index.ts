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
    const { invitationId, email, inviterName, propertyName, invitationUrl, role, userType, message } = await req.json()

    // Supabaseクライアントを初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    // Supabase標準メール機能を使用（認証メールと同じ仕組み）
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          invitation_type: 'property_share',
          invitation_id: invitationId,
          inviter_name: inviterName,
          property_name: propertyName,
          invitation_url: invitationUrl,
          role: role,
          user_type: userType,
          message: message || '',
          role_label: roleLabels[role] || role,
          user_type_label: userTypeLabels[userType] || userType
        },
        redirectTo: invitationUrl
      }
    )

    if (authError) {
      console.error('Supabase email sending failed:', authError)
      
      // フォールバック: ダミーユーザーを作成してメール送信を試行
      const { error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: 'temp-password-for-invitation-' + Date.now(),
        options: {
          data: {
            invitation_type: 'property_share',
            invitation_id: invitationId,
            inviter_name: inviterName,
            property_name: propertyName,
            invitation_url: invitationUrl,
            role: role,
            user_type: userType,
            message: message || '',
            is_invitation_signup: true
          },
          emailRedirectTo: invitationUrl
        }
      })

      if (signUpError) {
        throw new Error(`メール送信に失敗しました: ${signUpError.message}`)
      }
    }

    // 送信成功をSupabaseに記録
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
        message: 'Invitation email sent successfully via Supabase Auth',
        method: 'supabase_auth',
        authData: authData
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