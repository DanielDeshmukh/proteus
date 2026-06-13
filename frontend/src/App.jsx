import { useState, useEffect } from 'react'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'error' }))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">PROTEUS</h1>
          <p className="text-sm text-gray-500">JD-aware application toolkit</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          {health ? (
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${health.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-700">
                Backend: {health.status === 'ok' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">Checking backend...</span>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
