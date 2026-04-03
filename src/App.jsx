import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './lib/api';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
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
import AdminProfile from './pages/AdminProfile';
import AdminPartners from './pages/AdminPartners';
import AdminInvestors from './pages/AdminInvestors';
import AdminFamilies from './pages/AdminFamilies';
import AdminAccessControl from './pages/AdminAccessControl';
import AdminCommissionConfig from './pages/AdminCommissionConfig';
import AdminBrokerage from './pages/AdminBrokerage';
import ClientReports from './pages/ClientReports';
import FundDetail from './pages/FundDetail'
import PortfolioReport from './pages/PortfolioReport'

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
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
          <Route path="research/funds/:plan_id" element={<FundDetail />} />
          <Route path="research/compare" element={<ResearchCompare />} />
          <Route path="research/categories" element={<ResearchCategories />} />
          <Route path="research/calculators" element={<ResearchCalculators />} />
          <Route path="admin-controls" element={<Navigate to="/admin-controls/profile" replace />} />
          <Route path="admin-controls/profile" element={<AdminProfile />} />
          <Route path="admin-controls/partners" element={<AdminPartners />} />
          <Route path="admin-controls/investors" element={<AdminInvestors />} />
          <Route path="admin-controls/families" element={<AdminFamilies />} />
          <Route path="admin-controls/access" element={<AdminAccessControl />} />
          <Route path="admin-controls/commission" element={<AdminCommissionConfig />} />
          <Route path="admin-controls/brokerage" element={<AdminBrokerage />} />
          <Route path="client-reports" element={<ClientReports />} />
        </Route>
        <Route path="/report/portfolio/:type/:id" element={
          <PrivateRoute><PortfolioReport /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}