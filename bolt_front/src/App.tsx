import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './components/AuthProvider';
import Layout from './components/Layout';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import PropertyDetail from './pages/PropertyDetail';
import UserGuide from './pages/UserGuide';
import LandingPage from './pages/LandingPage';
// 2次リリース用: AI機能のインポート
// import MarketAnalysis from './pages/MarketAnalysis';
// import TransactionSearch from './pages/TransactionSearch';
import FAQ from './pages/FAQ';
import PremiumPlan from './pages/PremiumPlan';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import GoogleAuthTest from './pages/GoogleAuthTest';

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
  return (
    <AuthProvider>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <Routes>
          {/* パブリックページ */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/reset-password" element={<ResetPasswordConfirm />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/google-auth-test" element={<GoogleAuthTest />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="user-guide" element={<UserGuide />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="premium-plan" element={<PremiumPlan />} />
            <Route path="simulator" element={<Simulator />} />
            {/* 2次リリース用: AI機能のルート */}
            {/* <Route path="transaction-search" element={<TransactionSearch />} /> */}
            {/* <Route path="market-analysis" element={<MarketAnalysis />} /> */}
            <Route path="property-detail/:id" element={<PropertyDetail />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;