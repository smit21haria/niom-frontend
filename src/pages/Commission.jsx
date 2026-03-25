import TopBar from '../components/layout/TopBar'
import KPICard from '../components/ui/KPICard'
import Table from '../components/ui/Table'

export default function Commission() {
  return (
    <>
      <TopBar title="Commission" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard title="Total Commission" value="$0" />
          <KPICard title="Pending" value="$0" />
          <KPICard title="Paid YTD" value="$0" />
        </div>
        <Table columns={['Partner', 'Amount', 'Period', 'Status']} rows={[]} />
      </div>
    </>
  )
}
