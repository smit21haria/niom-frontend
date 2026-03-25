import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ marginTop: '60px', padding: '32px', flex: 1, background: 'var(--panel-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
