export default function KPICard({ title, value, subtitle }) {
  return (
    <div className="bg-white border border-forest/10 rounded-lg p-5 shadow-sm">
      <p className="text-sm text-forest/60 font-body">{title}</p>
      <p className="text-3xl font-display text-forest mt-1">{value}</p>
      {subtitle && <p className="text-xs text-forest/40 mt-1">{subtitle}</p>}
    </div>
  )
}
