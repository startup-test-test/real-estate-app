import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSharesAndInvitations() {
  console.log('=== 共有と招待の状況確認 ===');
  
  try {
    // property_sharesの内容確認
    const { data: shares, error: sharesError } = await supabase
      .from('property_shares')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    console.log('📊 最新の共有5件:');
    if (sharesError) {
      console.error('共有取得エラー:', sharesError);
    } else {
      console.log(shares);
    }
    
    // share_invitationsの内容確認
    const { data: invitations, error: invitationsError } = await supabase
      .from('share_invitations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    console.log('📧 最新の招待5件:');
    if (invitationsError) {
      console.error('招待取得エラー:', invitationsError);
    } else {
      console.log(invitations);
    }
    
  } catch (error) {
    console.error('チェックエラー:', error);
  }
}

checkSharesAndInvitations();
