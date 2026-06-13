import { useState } from "react"
import { Layout } from "../components/Layout"
import { JDInput } from "../components/JDInput"
import { ResumeInput } from "../components/ResumeInput"
import { Card, CardHeader, CardContent } from "../components/Card"
import { Spinner } from "../components/Spinner"
import { Toast } from "../components/Toast"

export function AnalyzePage() {
  const [jd, setJd] = useState(null)
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const canAnalyze = jd && resume

  const handleAnalyze = async () => {
    if (!canAnalyze) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()

      if (jd.type === "text") {
        formData.append("jd_text", jd.value)
      } else if (jd.type === "url") {
        formData.append("jd_url", jd.value)
      } else if (jd.type === "file") {
        formData.append("jd_file", jd.value)
      }

      if (resume.type === "text") {
        formData.append("resume_text", resume.value)
      } else if (resume.type === "file") {
        formData.append("resume_file", resume.value)
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Analyze Your Fit</h1>
          <p className="mt-2 text-gray-600">
            Paste a job description and your resume to get a match score, gap analysis, and tailored suggestions.
          </p>
        </div>

        {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Step 1: Job Description</h2>
          </CardHeader>
          <CardContent>
            <JDInput onJDReady={setJd} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Step 2: Your Resume</h2>
          </CardHeader>
          <CardContent>
            <ResumeInput onResumeReady={setResume} />
          </CardContent>
        </Card>

        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
            canAnalyze && !loading
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span>Analyzing...</span>
            </>
          ) : (
            "Run Analysis"
          )}
        </button>

        {result && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Results</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Overall Match Score</p>
                  <p className="text-5xl font-bold text-blue-600">
                    {Math.round((result.overall_score || 0) * 100)}%
                  </p>
                </div>

                {result.section_scores && (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(result.section_scores).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 capitalize">{key.replace("_", " ")}</p>
                        <p className="text-lg font-semibold">{Math.round(value * 100)}%</p>
                      </div>
                    ))}
                  </div>
                )}

                {result.action_list && result.action_list.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Priority Actions</h3>
                    <ul className="space-y-2">
                      {result.action_list.map((action, i) => (
                        <li key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                          <span className="font-medium">#{action.priority}</span> {action.action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center">
                  Run ID: {result.run_id} | {result.timings?.total?.toFixed(1)}s
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
