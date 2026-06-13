export function ActionList({ actions }) {
  if (!actions || actions.length === 0) return null

  const categoryColors = {
    add_skill: "border-l-red-500 bg-red-50",
    rewrite: "border-l-yellow-500 bg-yellow-50",
    surface_experience: "border-l-blue-500 bg-blue-50",
  }

  return (
    <div className="space-y-2">
      {actions.map((action, i) => (
        <div
          key={i}
          className={`p-3 border-l-4 rounded-r-lg ${categoryColors[action.category] || "border-l-gray-500 bg-gray-50"}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500">#{action.priority}</span>
              <span className="ml-2 text-sm font-medium text-gray-900">{action.action}</span>
            </div>
            <span className="text-xs text-gray-500">{action.impact}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
