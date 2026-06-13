export function ScoreDisplay({ score, label = "Overall Match" }) {
  const percentage = Math.round((score || 0) * 100)
  const color =
    percentage >= 75 ? "text-green-600" :
    percentage >= 50 ? "text-yellow-600" :
    "text-red-600"
  const bg =
    percentage >= 75 ? "bg-green-50" :
    percentage >= 50 ? "bg-yellow-50" :
    "bg-red-50"

  return (
    <div className={`text-center p-6 rounded-xl ${bg}`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-5xl font-bold ${color}`}>{percentage}%</p>
    </div>
  )
}
