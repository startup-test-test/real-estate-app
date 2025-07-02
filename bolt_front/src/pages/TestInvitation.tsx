import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  MessageCircle, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';
import { usePropertyShare } from '../hooks/usePropertyShare';
import CommentSection from '../components/CommentSection';
import SimpleCommentSection from '../components/SimpleCommentSection';
import TestCommentSection from '../components/TestCommentSection';

const TestInvitation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { createShare, sendInvitation, fetchShare } = usePropertyShare();
  
  const [step, setStep] = useState(1);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [share, setShare] = useState<any>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [invitationUrl, setInvitationUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // テスト用のプロパティID（UUID形式）
  const testPropertyId = crypto.randomUUID();
  const testPropertyName = 'テスト用投資物件';

  useEffect(() => {
    if (!user) {
      navigate('/login?test=true');
    }
  }, [user, navigate]);

  const handleCreateShare = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏗️ テスト用共有を作成中...');
      console.log('📋 作成パラメータ:', {
        propertyId: testPropertyId,
        title: `${testPropertyName}のシミュレーション結果`,
        description: 'テスト用の共有です',
        user: user
      });
      
      const newShare = await createShare(
        testPropertyId,
        `${testPropertyName}のシミュレーション結果`,
        'テスト用の共有です'
      );
      
      console.log('🔍 createShare結果:', newShare);
      
      if (newShare) {
        setShare(newShare);
        console.log('✅ テスト用共有作成完了:', newShare);
        setStep(2);
      } else {
        console.error('❌ createShareがnullを返しました');
        throw new Error('共有の作成に失敗しました。詳細はコンソールを確認してください。');
      }
    } catch (err: any) {
      console.error('❌ 共有作成エラー詳細:', {
        message: err.message,
        stack: err.stack,
        error: err
      });
      setError(`共有作成エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!share) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📧 テスト招待メール送信中...');
      
      const newInvitation = await sendInvitation(
        share.id,
        testEmail,
        'commenter',
        'consultant',
        'テスト用の招待メッセージです'
      );
      
      if (newInvitation) {
        setInvitation(newInvitation);
        const url = `${window.location.origin}/collaboration/${newInvitation.invitation_token}`;
        setInvitationUrl(url);
        console.log('✅ テスト招待送信完了:', newInvitation);
        setStep(3);
      } else {
        throw new Error('招待の送信に失敗しました');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('❌ 招待送信エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationUrl = () => {
    navigator.clipboard.writeText(invitationUrl);
    alert('招待URLをクリップボードにコピーしました');
  };

  const openInNewTab = () => {
    window.open(invitationUrl, '_blank');
  };

  if (!user) {
    return <div>ログインが必要です...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 招待機能テストページ
          </h1>
          
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-100' : 'bg-gray-100'}`}>
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 font-medium">共有作成</span>
            </div>
            
            <ArrowRight className="mx-4 text-gray-400" />
            
            <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-100' : 'bg-gray-100'}`}>
                {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className="ml-2 font-medium">招待送信</span>
            </div>
            
            <ArrowRight className="mx-4 text-gray-400" />
            
            <div className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-100' : 'bg-gray-100'}`}>
                {step > 3 ? <CheckCircle className="w-5 h-5" /> : '3'}
              </div>
              <span className="ml-2 font-medium">招待確認</span>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* ステップ1: 共有作成 */}
          {step === 1 && (
            <div className="text-center">
              <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4">テスト用共有を作成</h2>
              <p className="text-gray-600 mb-6">
                まず、テスト用の物件共有を作成します。
                <br />
                現在のユーザー: <strong>{user.email}</strong>
              </p>
              <button
                onClick={handleCreateShare}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center mx-auto"
              >
                {loading ? '作成中...' : '共有を作成'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </div>
          )}

          {/* ステップ2: 招待送信 */}
          {step === 2 && (
            <div className="text-center">
              <Mail className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4">テスト招待を送信</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  招待先メールアドレス
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full max-w-md mx-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="test@example.com"
                />
              </div>
              <button
                onClick={handleSendInvitation}
                disabled={loading || !testEmail}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center mx-auto"
              >
                {loading ? '送信中...' : '招待を送信'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </div>
          )}

          {/* ステップ3: 招待URL表示 */}
          {step === 3 && invitationUrl && (
            <div>
              <div className="text-center mb-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-4">招待URL生成完了</h2>
                <p className="text-gray-600">
                  以下のURLで招待リンクをテストできます
                </p>
              </div>

              {/* 招待URL */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  招待URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={invitationUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={copyInvitationUrl}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={openInNewTab}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
                
                {/* シンプルなコラボレーションリンク */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    シンプルコラボレーションURL（確実に動作）
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/simple-collaboration/${invitation?.invitation_token || 'demo-token'}`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        const simpleUrl = `${window.location.origin}/simple-collaboration/${invitation?.invitation_token || 'demo-token'}`;
                        navigator.clipboard.writeText(simpleUrl);
                        alert('シンプルコラボレーションURLをコピーしました');
                      }}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        const simpleUrl = `${window.location.origin}/simple-collaboration/${invitation?.invitation_token || 'demo-token'}`;
                        window.open(simpleUrl, '_blank');
                      }}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    💡 このURLはデータベース制約を回避して確実に動作します
                  </p>
                </div>
              </div>

              {/* テスト手順 */}
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">🔍 テスト手順</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li>上記の招待URLを新しいタブで開く</li>
                  <li>ログインまたは新規会員登録を行う</li>
                  <li>コラボレーションページでコメントを投稿</li>
                  <li>このページに戻ってコメントが表示されるか確認</li>
                </ol>
              </div>

              {/* テスト用コメント機能（LocalStorage） */}
              <div className="mb-6">
                <TestCommentSection title="テスト用コメント機能（LocalStorage）" />
              </div>

              {/* シンプルコメント機能のテスト */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Supabaseコメント機能
                </h3>
                {share?.id ? (
                  <SimpleCommentSection 
                    pageId={share.id}
                    title="Supabase連携コメント"
                  />
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      💡 まず共有を作成してからSupabaseコメント機能をテストしてください。
                    </p>
                  </div>
                )}
              </div>

              {/* 従来のコメント表示（比較用） */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  従来のコメント表示（比較用）
                </h3>
                <CommentSection
                  shareId={share?.id || 'test-share'}
                  canComment={true}
                />
              </div>

              {/* リセットボタン */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setStep(1);
                    setShare(null);
                    setInvitation(null);
                    setInvitationUrl('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  新しいテストを開始
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestInvitation;