import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function createSimpleCommentsTable() {
  console.log('=== シンプルコメントテーブル作成 ===');
  
  try {
    // simple_commentsテーブルをsupabaseで直接作成（SQL実行）
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- シンプルなコメントテーブルを作成
        CREATE TABLE IF NOT EXISTS simple_comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          user_email VARCHAR(255),
          content TEXT NOT NULL,
          page_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- インデックスを作成
        CREATE INDEX IF NOT EXISTS idx_simple_comments_page_id ON simple_comments(page_id);
        CREATE INDEX IF NOT EXISTS idx_simple_comments_user_id ON simple_comments(user_id);
        CREATE INDEX IF NOT EXISTS idx_simple_comments_created_at ON simple_comments(created_at DESC);

        -- RLSポリシーを設定
        ALTER TABLE simple_comments ENABLE ROW LEVEL SECURITY;

        -- ポリシーを作成
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'simple_comments' AND policyname = 'Anyone can view simple comments') THEN
            CREATE POLICY "Anyone can view simple comments" ON simple_comments FOR SELECT USING (true);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'simple_comments' AND policyname = 'Authenticated users can post simple comments') THEN
            CREATE POLICY "Authenticated users can post simple comments" ON simple_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'simple_comments' AND policyname = 'Users can edit their own simple comments') THEN
            CREATE POLICY "Users can edit their own simple comments" ON simple_comments FOR UPDATE USING (auth.uid() = user_id);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'simple_comments' AND policyname = 'Users can delete their own simple comments') THEN
            CREATE POLICY "Users can delete their own simple comments" ON simple_comments FOR DELETE USING (auth.uid() = user_id);
          END IF;
        END $$;
      `
    });
    
    if (error) {
      console.error('SQL実行エラー:', error);
      // 直接INSERT文でテスト
      console.log('代替案: テストコメントを直接挿入...');
      
      const { data: testData, error: testError } = await supabase
        .from('simple_comments')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          user_email: 'test@example.com',
          content: 'テストコメントです',
          page_id: 'test-page'
        })
        .select();
        
      if (testError) {
        console.error('テストコメント挿入エラー:', testError);
      } else {
        console.log('✅ テストコメント挿入成功:', testData);
      }
    } else {
      console.log('✅ テーブル作成成功:', data);
    }
    
    // テーブル存在確認
    const { data: checkData, error: checkError } = await supabase
      .from('simple_comments')
      .select('count')
      .limit(1);
      
    if (checkError) {
      console.error('❌ テーブル確認エラー:', checkError);
    } else {
      console.log('✅ simple_commentsテーブルが正常に動作しています');
    }
    
  } catch (error) {
    console.error('処理エラー:', error);
  }
}

createSimpleCommentsTable();
