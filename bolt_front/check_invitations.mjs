import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkInvitations() {
  console.log('=== 招待データベース確認 ===');
  
  try {
    // share_invitationsテーブルの全データ確認
    const { data: invitations, error: invError } = await supabase
      .from('share_invitations')
      .select('*')
      .order('created_at', { ascending: false });
      
    console.log('📧 share_invitations テーブル:');
    if (invError) {
      console.error('エラー:', invError);
    } else {
      console.log('件数:', invitations?.length || 0);
      console.log('データ:', invitations);
    }
    
    // property_sharesテーブルの確認
    const { data: shares, error: shareError } = await supabase
      .from('property_shares')
      .select('*')
      .order('created_at', { ascending: false });
      
    console.log('📊 property_shares テーブル:');
    if (shareError) {
      console.error('エラー:', shareError);
    } else {
      console.log('件数:', shares?.length || 0);
      console.log('データ:', shares);
    }
    
    // 特定の招待トークンを検索
    const testToken = '9704ff40e9024a7fabe0cd5853caa45d';
    const { data: specificInv, error: specificError } = await supabase
      .from('share_invitations')
      .select('*')
      .eq('invitation_token', testToken);
      
    console.log('🔍 特定トークン検索:', {
      token: testToken,
      result: specificInv,
      error: specificError
    });
    
  } catch (error) {
    console.error('チェックエラー:', error);
  }
}

checkInvitations();
