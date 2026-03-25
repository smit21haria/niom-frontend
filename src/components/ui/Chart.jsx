export default function Chart({ title }) {
  return (
    <div className="bg-white border border-forest/10 rounded-lg p-5 shadow-sm">
      <p className="text-sm font-body text-forest/60 mb-3">{title}</p>
      <div className="h-40 flex items-center justify-center text-forest/30 text-sm">
        Chart placeholder
      </div>
    </div>
  )
}
