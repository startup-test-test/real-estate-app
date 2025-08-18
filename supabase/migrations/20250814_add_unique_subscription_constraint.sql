● assetsディレクトリはローカルには存在しています。FTPサーバー側で/public_html/assetsディレクトリが存在しないためエラーになっています。-- 二重決済防止のためのUNIQUE制約を追加
-- 1ユーザーにつき、アクティブで解約予定でないサブスクリプションは1つまで

-- 既存のインデックスがあれば削除
DROP INDEX IF EXISTS idx_one_active_subscription_per_user;

-- 新しいUNIQUE制約を追加
-- statusが'active'で、cancel_at_period_endがfalseの場合、user_idはユニークでなければならない
CREATE UNIQUE INDEX idx_one_active_subscription_per_user 
ON subscriptions(user_id) 
WHERE status = 'active' AND cancel_at_period_end = false;

-- コメントを追加
COMMENT ON INDEX idx_one_active_subscription_per_user IS 
'各ユーザーは1つのアクティブなサブスクリプションのみ持つことができる（解約予定のものは除く）';