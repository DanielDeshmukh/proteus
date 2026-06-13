import { Layout } from "../components/Layout"
import { Card, CardContent } from "../components/Card"

export function HistoryPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Application History</h1>
        <Card>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              History will be populated after your first analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
