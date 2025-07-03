import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('=== テーブル存在確認 ===');
  
  try {
    // テーブル存在確認
    const tables = ['property_shares', 'share_comments', 'comment_reactions'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} テーブルが存在しません: ${error.message}`);
      } else {
        console.log(`✅ ${table} テーブルが存在します`);
      }
    }
    
  } catch (error) {
    console.error('テーブルチェックエラー:', error);
  }
}

checkTables();
