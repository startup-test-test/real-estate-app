import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './components/AuthProvider';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import MyPage from './pages/MyPage';
import Simulator from './pages/Simulator';
import UserGuide from './pages/UserGuide';
import LandingPage from './pages/LandingPage';
import PaymentResult from './pages/PaymentResult';
// 2次リリース用: AI機能のインポート
import MarketAnalysis from './pages/MarketAnalysis';
import LandPrice from './pages/LandPrice';
// import TransactionSearch from './pages/TransactionSearch';
import FAQ from './pages/FAQ';
import PremiumPlan from './pages/PremiumPlan';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Tokushoho from './pages/Tokushoho';
import Disclaimer from './pages/Disclaimer';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import Maintenance from './pages/Maintenance';

// メンテナンスモード: 環境変数で制御（true にするとメンテナンス画面を表示）
const MAINTENANCE_MODE = true;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthContext();
  
  console.log('ProtectedRoute状態:', {
    isAuthenticated,
    loading,
    user: user ? { id: user.id, email: user.email } : null
  })
  
  if (loading) {
    console.log('ProtectedRoute: 認証ローディング中')
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute: 認証されていないためログインページへリダイレクト')
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute: 認証済み、ページを表示')
  return <>{children}</>;
};
// Loginページも削除
// APITestページを削除

function App() {
  // メンテナンスモードの場合は、すべてのページをメンテナンス画面にリダイレクト
  if (MAINTENANCE_MODE) {
    return (
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <Routes>
          <Route path="*" element={<Maintenance />} />
        </Routes>
      </Router>
    );
  }

  return (
    <AuthProvider>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <Routes>
          {/* パブリックページ */}
          {/* ランディングページをルートに移動 */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/reset-password" element={<ResetPasswordConfirm />} />
          {/* 利用規約関連ページ（ログイン不要） */}
          <Route path="/tokushoho" element={<Tokushoho />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          {/* 保護されたページ（Layoutを共有） */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/user-guide" element={<UserGuide />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/premium-plan" element={
              <ErrorBoundary>
                <PremiumPlan />
              </ErrorBoundary>
            } />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            {/* AI機能のルート */}
            <Route path="/market-analysis" element={<MarketAnalysis />} />
            <Route path="/land-prices" element={<LandPrice />} />
            {/* <Route path="/transaction-search" element={<TransactionSearch />} /> */}
          </Route>
          {/* 404ページ - すべてのルートの最後に配置 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;