export function GapAnalysisDisplay({ gaps }) {
  if (!gaps || !gaps.gaps || gaps.gaps.length === 0) return null

  const statusColors = {
    matched: "bg-green-100 text-green-800 border-green-200",
    partial: "bg-yellow-100 text-yellow-800 border-yellow-200",
    missing: "bg-red-100 text-red-800 border-red-200",
  }

  const statusLabels = {
    matched: "Matched",
    partial: "Partial",
    missing: "Missing",
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-green-600 font-medium">{gaps.matched_count} matched</span>
        <span className="text-yellow-600 font-medium">{gaps.partial_count} partial</span>
        <span className="text-red-600 font-medium">{gaps.missing_count} missing</span>
        <span className="text-gray-400">/ {gaps.total_requirements} total</span>
      </div>

      <div className="space-y-2">
        {gaps.gaps.map((gap, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded-lg border ${statusColors[gap.status]}`}
          >
            <div className="flex-1">
              <span className="font-medium">{gap.requirement}</span>
              <span className="text-xs ml-2 opacity-70">({gap.category})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">{Math.round(gap.similarity_score * 100)}%</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50">
                {statusLabels[gap.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
