import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTableSchema() {
  console.log('=== share_commentsテーブル構造確認 ===');
  
  try {
    // テーブルのスキーマを確認するため、エラーを意図的に発生させる
    const { data, error } = await supabase
      .from('share_comments')
      .select('*')
      .limit(1);
      
    console.log('テーブル存在確認:', { error: error || 'テーブルは存在します' });
    
    if (data) {
      console.log('サンプルデータ:', data);
    }
    
    // user_emailカラムの確認
    const { data: emailTest, error: emailError } = await supabase
      .from('share_comments')
      .select('user_email')
      .limit(1);
      
    console.log('user_emailカラム確認:', { emailError });
    
  } catch (error) {
    console.error('テーブルチェックエラー:', error);
  }
}

checkTableSchema();
