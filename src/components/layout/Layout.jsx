import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '40px 48px 80px', background: 'var(--panel-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
