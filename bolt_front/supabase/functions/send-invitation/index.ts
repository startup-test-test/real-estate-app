import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SecureLogger } from '../_shared/secureLogger.ts'
import { generateInvitationTempPassword } from '../_shared/cryptoPassword.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// SEC-039: セキュアログインスタンスを作成
const logger = new SecureLogger({ functionName: 'send-invitation' })

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // リクエストボディを取得
    const { invitationId, email, inviterName, propertyName, invitationUrl, role, userType, message } = await req.json()

    // SEC-040: 最小権限の原則に従ったクライアント初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // 通常操作用クライアント（Anon Key使用）
    const publicClient = createClient(supabaseUrl, supabaseAnonKey)
    
    // 管理操作専用クライアント（Service Role Key使用）
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

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

    // SEC-040: 管理操作のみadminClientを使用
    // メール送信は管理者権限が必要なため、adminClientを使用
    const { error: authError } = await adminClient.auth.admin.inviteUserByEmail(
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
      // SEC-039: 機密情報をマスクしてログ出力
      logger.error('Supabase email sending failed', authError)
      
      // フォールバック: ダミーユーザーを作成してメール送信を試行
      // SEC-050: 暗号学的に安全な一時パスワードを生成
      const securePassword = generateInvitationTempPassword();
      const { error: signUpError } = await adminClient.auth.signUp({
        email: email,
        password: securePassword,
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

    // SEC-040: 通常のデータ操作はpublicClientを使用
    // share_invitationsテーブルへの更新はRLSで保護されているが、
    // この操作は招待送信の完了を記録するシステム操作のため、adminClientを使用
    const { error: updateError } = await adminClient
      .from('share_invitations')
      .update({ 
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)
    
    if (updateError) {
      logger.warn('Failed to update invitation status', { invitationId })
    }
    
    // SEC-040: 監査ログの記録（Service Role Key使用を追跡）
    await adminClient
      .from('edge_function_audit_logs')
      .insert({
        function_name: 'send-invitation',
        action: 'send_invitation_email',
        details: {
          invitation_id: invitationId,
          recipient_email: email.replace(/(.{2}).*@/, '$1***@'),
          role: role,
          user_type: userType
        },
        performed_at: new Date().toISOString()
      })
      .catch((err: any) => logger.error('Failed to create audit log', err))

    // SEC-039: 成功ログ（機密情報を含まない）
    logger.info('Invitation email sent successfully', { 
      invitationId, 
      recipientEmail: email.replace(/(.{2}).*@/, '$1***@'), // メールを部分マスク
      role,
      userType 
    })
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully via Supabase Auth',
        method: 'supabase_auth'
        // SEC-039: authDataは機密情報なのでレスポンスから除外
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    // SEC-039: 機密情報をマスクしてログ出力
    logger.error('Error sending invitation email', error)
    
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