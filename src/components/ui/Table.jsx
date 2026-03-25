export default function Table({ columns = [], rows = [] }) {
  return (
    <div className="bg-white border border-forest/10 rounded-lg overflow-hidden shadow-sm">
      <table className="w-full text-sm font-body">
        <thead className="bg-forest text-ivory">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-forest/40"
              >
                No data
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-t border-forest/10 hover:bg-ivory/50">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-forest/80">
                    {row[col] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
