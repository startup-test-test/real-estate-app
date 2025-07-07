import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './components/AuthProvider';
import Layout from './components/Layout';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import SimulationResult from './pages/SimulationResult';
import PropertyDetail from './pages/PropertyDetail';
import UserGuide from './pages/UserGuide';
// 2次リリース用: AI機能のインポート
// import MarketAnalysis from './pages/MarketAnalysis';
// import TransactionSearch from './pages/TransactionSearch';
import FAQ from './pages/FAQ';
import PremiumPlan from './pages/PremiumPlan';
import ShareView from './pages/ShareView';
import CollaborationView from './pages/CollaborationView';
import SimpleCollaboration from './pages/SimpleCollaboration';

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
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/share/:shareId" element={<ShareView />} />
          <Route path="/collaboration/:token" element={<CollaborationView />} />
          <Route path="/simple-collaboration/:token" element={<SimpleCollaboration />} />
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
            <Route path="simulation-result/:id" element={<SimulationResult />} />
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