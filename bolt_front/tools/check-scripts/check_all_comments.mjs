import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkAllComments() {
  console.log('=== 全コメントテーブルの状況確認 ===');
  
  try {
    // share_commentsの確認
    const { data: shareComments, error: shareError } = await supabase
      .from('share_comments')
      .select('*')
      .order('created_at', { ascending: false });
      
    console.log('📝 share_comments テーブル:');
    if (shareError) {
      console.error('エラー:', shareError);
    } else {
      console.log('件数:', shareComments?.length || 0);
      console.log('データ:', shareComments);
    }
    
    // simple_commentsがあるかチェック
    const { data: simpleComments, error: simpleError } = await supabase
      .from('simple_comments')
      .select('*')
      .order('created_at', { ascending: false });
      
    console.log('💬 simple_comments テーブル:');
    if (simpleError) {
      console.error('エラー:', simpleError);
    } else {
      console.log('件数:', simpleComments?.length || 0);
      console.log('データ:', simpleComments);
    }
    
  } catch (error) {
    console.error('チェックエラー:', error);
  }
}

checkAllComments();
