import TopBar from '../components/layout/TopBar'
import Table from '../components/ui/Table'

export default function Investors() {
  return (
    <>
      <TopBar title="Investors" />
      <div className="p-6">
        <Table columns={['Name', 'Type', 'Portfolio Value', 'Risk Profile']} rows={[]} />
      </div>
    </>
  )
}
