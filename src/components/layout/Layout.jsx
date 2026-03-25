import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div style={{ backgroundColor: '#f4f2ee', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, padding: 32, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
