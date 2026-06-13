import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AnalyzePage } from "./pages/AnalyzePage"
import { HistoryPage } from "./pages/HistoryPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnalyzePage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
