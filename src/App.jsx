import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import Investors from './pages/Investors';
import Families from './pages/Families';
import Commission from './pages/Commission';
import Research from './pages/Research';
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
          <Route path="investors" element={<Investors />} />
          <Route path="families" element={<Families />} />
          <Route path="commission" element={<Commission />} />
          <Route path="research" element={<Research />} />
          <Route path="admin-controls" element={<AdminControls />} />
          <Route path="client-reports" element={<ClientReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
