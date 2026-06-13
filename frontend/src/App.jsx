import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AnalyzePage } from "./pages/AnalyzePage"
import { HistoryPage } from "./pages/HistoryPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { ErrorPage } from "./pages/ErrorPage"
import { ErrorBoundary } from "./components/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AnalyzePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
