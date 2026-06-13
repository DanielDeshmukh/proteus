import { useState } from "react"
import { Layout } from "../components/Layout"
import { JDInput } from "../components/JDInput"
import { Card, CardHeader, CardContent } from "../components/Card"

export function AnalyzePage() {
  const [jd, setJd] = useState(null)

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Analyze Your Fit</h1>
          <p className="mt-2 text-gray-600">
            Paste a job description and your resume to get a match score, gap analysis, and tailored suggestions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Step 1: Job Description</h2>
          </CardHeader>
          <CardContent>
            <JDInput onJDReady={setJd} />
          </CardContent>
        </Card>

        {jd && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Step 2: Your Resume</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">Resume input coming next...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
