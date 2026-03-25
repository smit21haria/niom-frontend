import TopBar from '../components/layout/TopBar'
import Table from '../components/ui/Table'

export default function Partners() {
  return (
    <>
      <TopBar title="Partners" />
      <div className="p-6">
        <Table columns={['Name', 'Status', 'AUM', 'Joined']} rows={[]} />
      </div>
    </>
  )
}
