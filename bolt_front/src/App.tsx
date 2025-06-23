import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 認証機能を削除
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import PropertyDetail from './pages/PropertyDetail';
import UserGuide from './pages/UserGuide';
import MarketAnalysis from './pages/MarketAnalysis';
import TransactionSearch from './pages/TransactionSearch';
import MLITDataSearch from './pages/MLITDataSearch';
import FAQ from './pages/FAQ';
import PremiumPlan from './pages/PremiumPlan';
// Loginページも削除
// APITestページを削除

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="user-guide" element={<UserGuide />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="premium-plan" element={<PremiumPlan />} />
          <Route path="transaction-search" element={<TransactionSearch />} />
          <Route path="mlit-data-search" element={<MLITDataSearch />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="market-analysis" element={<MarketAnalysis />} />
          <Route path="property-detail/:id" element={<PropertyDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;