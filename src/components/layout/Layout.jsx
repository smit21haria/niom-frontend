import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}
