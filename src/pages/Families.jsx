import TopBar from '../components/layout/TopBar'
import Table from '../components/ui/Table'

export default function Families() {
  return (
    <>
      <TopBar title="Families" />
      <div className="p-6">
        <Table columns={['Family Name', 'Members', 'AUM', 'Advisor']} rows={[]} />
      </div>
    </>
  )
}
