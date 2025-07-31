import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { 
  Calculator, 
  User,
  Home,
  Menu,
  X,
  Settings,
  BookOpen,
  HelpCircle,
  Crown,
  Database,
  LogOut
} from 'lucide-react';

const Layout: React.FC = () => {
  // 認証機能を削除してシンプル化
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

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
    { name: 'マイページ', href: '/', icon: Home },
    { name: '物件収益シミュレーター', href: '/simulator', icon: Calculator },
    // 2次リリース用: AI取引事例検索・AI市場分析
    // { name: 'AI取引事例検索', href: '/transaction-search', icon: Search },
    // { name: 'AI市場分析', href: '/market-analysis', icon: TrendingUp },
  ];

  const supportNavigation = [
    { name: 'はじめに・ご利用ガイド', href: '/user-guide', icon: BookOpen },
    { name: 'よくある質問', href: '/faq', icon: HelpCircle },
    { name: '有料プランについて', href: '/premium-plan', icon: Crown },
  ];

  // APIテストページを削除したのでdevNavigationも削除

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button - Top Right */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-slate-800 text-white rounded-lg shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Integrated Header and Logo Design */}
      <div className={`fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Integrated Header with Logo */}
          <div className="p-6 border-b border-slate-600/30">
            {/* Logo Section */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Home className="h-8 w-8 text-white mr-3" />
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'serif' }}>大家DX</span>
              </div>
              <p className="text-white/70 text-sm font-medium">AIが導く、あなたの賃貸経営の未来。</p>
            </div>

            {/* Profile Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{user?.email || 'ゲストユーザー'}</div>
                </div>
              </div>
              <button className="p-1 text-white hover:bg-white/10 rounded transition-colors">
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
                          ? 'bg-white/10 text-white border-l-4 border-white'
                          : 'text-white/80 hover:bg-white/5 hover:text-white'
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
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">サポート</h3>
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
                            ? 'bg-white/10 text-white'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
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
          <div className="p-4 border-t border-slate-600/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              ログアウト
            </button>
          </div>

          {/* Contact Info */}
          <div className="p-4 border-t border-slate-600/30">
            <div className="text-sm">
              <div className="font-medium text-white mb-1">サポート</div>
              <div className="text-white/70">support@ooya-dx.com</div>
              <div className="text-xs text-white/50 mt-1">平日 9:00-18:00</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;