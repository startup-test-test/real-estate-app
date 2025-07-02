const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkComments() {
  console.log('=== データベース状況確認 ===');
  
  try {
    // share_commentsテーブルの内容確認
    const { data: comments, error: commentsError } = await supabase
      .from('share_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    console.log('📝 最新のコメント10件:');
    if (commentsError) {
      console.error('コメント取得エラー:', commentsError);
    } else {
      console.log(comments);
      console.log('コメント総数:', comments?.length || 0);
    }
    
    // property_sharesテーブルの内容確認
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
      console.log('共有総数:', shares?.length || 0);
    }
    
  } catch (error) {
    console.error('チェックエラー:', error);
  }
}

checkComments();
