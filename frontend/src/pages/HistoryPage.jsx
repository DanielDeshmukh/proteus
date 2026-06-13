import { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { Card, CardContent } from "../components/Card"
import { Spinner } from "../components/Spinner"

export function HistoryPage() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRun, setSelectedRun] = useState(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/history?limit=50")
      if (!res.ok) throw new Error("Failed to fetch history")
      const data = await res.json()
      setRuns(data.runs || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (runId, e) => {
    e.stopPropagation()
    if (!confirm("Delete this run?")) return
    try {
      await fetch(`/api/history/${runId}`, { method: "DELETE" })
      setRuns(runs.filter((r) => r.id !== runId))
      if (selectedRun?.id === runId) setSelectedRun(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredRuns = runs.filter((run) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (run.jd_text && run.jd_text.toLowerCase().includes(q)) ||
      (run.jd_source && run.jd_source.toLowerCase().includes(q))
    )
  })

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "text-gray-400"
    if (score >= 0.75) return "text-green-600"
    if (score >= 0.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
      running: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-gray-100 text-gray-800",
    }
    return styles[status] || styles.pending
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Application History</h1>
          <span className="text-sm text-gray-500">{runs.length} runs</span>
        </div>

        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by JD text or source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredRuns.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No analysis runs yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  {search ? "No results match your search" : "Run your first analysis to see history here"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRuns.map((run) => (
              <div
                key={run.id}
                className={`p-4 bg-white border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedRun?.id === run.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                }`}
                onClick={() => setSelectedRun(selectedRun?.id === run.id ? null : run)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${getScoreColor(run.overall_score)}`}>
                      {run.overall_score !== null ? `${Math.round(run.overall_score * 100)}%` : "—"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                        {run.jd_text ? run.jd_text.substring(0, 80) + "..." : "No JD text"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {run.jd_source} | {new Date(run.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(run.status)}`}>
                      {run.status}
                    </span>
                    <button
                      onClick={(e) => handleDelete(run.id, e)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {selectedRun?.id === run.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {run.section_scores && (
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(JSON.parse(run.section_scores)).map(([key, val]) => (
                          <div key={key} className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500 capitalize">{key.replace("_", " ")}</p>
                            <p className="text-sm font-semibold">{Math.round(val * 100)}%</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {run.jd_text && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">JD Preview</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
                          {run.jd_text.substring(0, 300)}...
                        </p>
                      </div>
                    )}

                    {run.error_message && (
                      <div className="p-2 bg-red-50 rounded text-xs text-red-700">
                        {run.error_message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
