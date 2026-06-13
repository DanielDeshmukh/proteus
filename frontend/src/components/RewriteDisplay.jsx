export function RewriteDisplay({ rewrites }) {
  if (!rewrites || !rewrites.suggestions || rewrites.suggestions.length === 0) return null

  return (
    <div className="space-y-3">
      {rewrites.suggestions.map((suggestion, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Impact: {Math.round(suggestion.impact_score * 100)}%
            </span>
            <span className="text-xs text-blue-600">{suggestion.target_requirement}</span>
          </div>

          <div className="space-y-1">
            <div className="p-2 bg-red-50 rounded text-sm text-red-800 line-through">
              {suggestion.original_bullet}
            </div>
            <div className="p-2 bg-green-50 rounded text-sm text-green-800">
              {suggestion.suggested_rewrite}
            </div>
          </div>

          <p className="text-xs text-gray-500">{suggestion.rationale}</p>
        </div>
      ))}

      {rewrites.hidden_experience && rewrites.hidden_experience.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">Hidden Experience Detected</p>
          <ul className="text-sm text-blue-700 space-y-1">
            {rewrites.hidden_experience.map((exp, i) => (
              <li key={i}>• {exp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
