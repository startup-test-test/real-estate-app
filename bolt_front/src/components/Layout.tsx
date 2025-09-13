import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import Footer from './Footer';
import { checkUsageLimit } from '../utils/usageLimit';
import { calculateRemainingDays, formatRemainingTime } from '../utils/subscriptionHelpers';
import { supabase } from '../lib/supabase';
import { 
  Calculator, 
  User,
  Home,
  Menu,
  X,
  Settings,
  BookOpen,
  Crown,
  LogOut,
  Sparkles
} from 'lucide-react';

const Layout: React.FC = () => {
  // 認証機能を削除してシンプル化
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (user?.id) {
        // 利用制限ステータスを確認
        const status = await checkUsageLimit(user.id);
        setIsPremium(status.isSubscribed);
        
        // サブスクリプション詳細を取得
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        // エラーチェック（PGRST116は0件の結果なので無視）
        if (error && error.code !== 'PGRST116') {
          console.error('Subscription fetch error:', error);
        }
        
        // 配列の最初の要素を取得
        if (data && data.length > 0) {
          setSubscription(data[0]);
        }
      }
    };
    checkPremiumStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('ログアウトエラー:', error);
      // エラーが発生してもログインページにリダイレクト
      navigate('/login', { replace: true });
    }
  };

  const navigation = [
    { name: 'マイページ', href: '/mypage', icon: Home },
    { name: '収益シミュレーター', href: '/simulator', icon: Calculator },
    // 2次リリース用: AI取引事例検索・AI市場分析
    // { name: 'AI取引事例検索', href: '/transaction-search', icon: Search },
    // { name: 'AI市場分析', href: '/market-analysis', icon: TrendingUp },
  ];

  const supportNavigation = [
    { name: 'ご利用ガイド・よくある質問', href: '/user-guide', icon: BookOpen },
    { name: '有料プランについて', href: '/premium-plan', icon: Crown },
  ];

  // APIテストページを削除したのでdevNavigationも削除

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - SP版のみ表示、印刷時は非表示 */}
      <div className="lg:hidden print:hidden fixed top-0 left-0 right-0 bg-white shadow-lg" style={{ zIndex: 99999 }}>
        {/* Logo Section */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link to="/mypage" className="flex items-center">
            <img 
              src="/img/logo_250709_2.png" 
              alt="Logo" 
              className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
          
          {/* Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay - 印刷時は非表示 */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden print:hidden fixed inset-0 bg-black/50"
          style={{ zIndex: 10001 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Integrated Header and Logo Design - 印刷時は非表示 */}
      <div className={`fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 print:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ zIndex: 10002 }}>
        <div className="flex h-full flex-col">
          {/* Integrated Header with Logo */}
          <div className="p-6 border-b border-gray-200">
            {/* Logo Section */}
            <div className="mb-6">
              <Link to="/mypage" className="block">
                <div className="flex justify-center mb-3 transition-transform hover:scale-105">
                  <img 
                    src="/img/logo_250709_2.png" 
                    alt="Logo" 
                    className="h-11 w-auto cursor-pointer"
                  />
                </div>
              </Link>
              <p className="text-gray-600 text-sm font-medium text-center">AIが導く、あなたの賃貸経営の未来。</p>
            </div>

            {/* Profile Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-gray-800 font-medium text-sm">{user?.email || 'ゲストユーザー'}</div>
                  {isPremium ? (
                    <div className="flex items-center mt-1">
                      <Sparkles className="h-4 w-4 text-yellow-500 mr-1" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                          ベーシックプラン
                        </span>
                        {subscription?.cancel_at_period_end && subscription?.cancel_at && (
                          <span className="text-sm text-amber-600 font-medium">
                            ({formatRemainingTime(calculateRemainingDays(subscription.cancel_at))})
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-bold text-gray-500">フリープラン</span>
                    </div>
                  )}
                </div>
              </div>
              <button className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-2 mb-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-4 text-base font-medium rounded-lg transition-colors relative ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="mr-4 h-6 w-6" />
                    {item.name}
                    {/* Active indicator dot */}
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full opacity-0 group-[.bg-white\/10]:opacity-100 transition-opacity" />
                    </div>
                  </NavLink>
                );
              })}
            </div>

            {/* Support Section */}
            <div className="mb-8">
              <div className="px-4 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">サポート</h3>
              </div>
              <div className="space-y-2">
                {supportNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>

          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              ログアウト
            </button>
          </div>

          {/* Legal Links */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2 mb-4 px-2">
              <NavLink
                to="/terms"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                利用規約
              </NavLink>
              <NavLink
                to="/privacy"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                個人情報取り扱いについて
              </NavLink>
              <NavLink
                to="/tokushoho"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                特定商取引法に基づく表記
              </NavLink>
              <a
                href="https://startup-marketing.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                運営会社
              </a>
            </div>
            
            {/* Copyright */}
            <p className="text-xs text-gray-600 text-center">
              © 2025 StartupMarketing Inc.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - 印刷時はパディングなし */}
      <div className="lg:pl-72 print:pl-0">
        <main className="min-h-screen pt-16 lg:pt-0 print:pt-0 flex flex-col print:min-h-0">
          <div className="flex-grow">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;