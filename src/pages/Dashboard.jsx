import TopBar from '../components/layout/TopBar'
import KPICard from '../components/ui/KPICard'
import Chart from '../components/ui/Chart'

export default function Dashboard() {
  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard title="Total AUM" value="$0" subtitle="As of today" />
          <KPICard title="Active Partners" value="0" />
          <KPICard title="Total Families" value="0" />
        </div>
        <Chart title="AUM Over Time" />
      </div>
    </>
  )
}
