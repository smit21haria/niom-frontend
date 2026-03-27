import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import PartnerDetail from './pages/PartnerDetail';
import Investors from './pages/Investors';
import InvestorDetail from './pages/InvestorDetail';
import Families from './pages/Families';
import FamilyDetail from './pages/FamilyDetail';
import Commission from './pages/Commission';
import ResearchFunds from './pages/ResearchFunds';
import ResearchCompare from './pages/ResearchCompare';
import ResearchCategories from './pages/ResearchCategories';
import ResearchCalculators from './pages/ResearchCalculators';
import AdminControls from './pages/AdminControls';
import ClientReports from './pages/ClientReports';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="partners" element={<Partners />} />
          <Route path="partners/:id" element={<PartnerDetail />} />
          <Route path="investors" element={<Investors />} />
          <Route path="investors/:id" element={<InvestorDetail />} />
          <Route path="families" element={<Families />} />
          <Route path="families/:id" element={<FamilyDetail />} />
          <Route path="commission" element={<Commission />} />
          <Route path="research" element={<Navigate to="/research/funds" replace />} />
          <Route path="research/funds" element={<ResearchFunds />} />
          <Route path="research/compare" element={<ResearchCompare />} />
          <Route path="research/categories" element={<ResearchCategories />} />
          <Route path="research/calculators" element={<ResearchCalculators />} />
          <Route path="admin-controls" element={<AdminControls />} />
          <Route path="client-reports" element={<ClientReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
