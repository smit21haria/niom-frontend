export default function TopBar({ title }) {
  return (
    <header className="h-14 bg-ivory border-b border-forest/10 flex items-center px-6">
      <h2 className="font-display text-xl text-forest">{title}</h2>
    </header>
  )
}
