import { useState } from "react"
import { Tabs } from "./Tabs"
import { TextArea } from "./TextArea"
import { FileUpload } from "./FileUpload"

const tabs = [
  { id: "paste", label: "Paste Text" },
  { id: "upload", label: "Upload File" },
  { id: "url", label: "Job URL" },
]

export function JDInput({ onJDReady }) {
  const [activeTab, setActiveTab] = useState("paste")
  const [jdText, setJdText] = useState("")
  const [jdFile, setJdFile] = useState(null)
  const [jdUrl, setJdUrl] = useState("")
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (activeTab === "paste" && !jdText.trim()) {
      newErrors.jdText = "Please enter a job description"
    }
    if (activeTab === "upload" && !jdFile) {
      newErrors.jdFile = "Please upload a file"
    }
    if (activeTab === "url" && !jdUrl.trim()) {
      newErrors.jdUrl = "Please enter a URL"
    }
    if (activeTab === "url" && jdUrl.trim() && !jdUrl.startsWith("http")) {
      newErrors.jdUrl = "Please enter a valid URL"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (activeTab === "paste") {
      onJDReady({ type: "text", value: jdText })
    } else if (activeTab === "upload") {
      onJDReady({ type: "file", value: jdFile })
    } else {
      onJDReady({ type: "url", value: jdUrl })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Job Description</h3>
        <p className="text-sm text-gray-500">Provide the JD via text, file, or URL</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pt-2">
        {activeTab === "paste" && (
          <TextArea
            placeholder="Paste the full job description here..."
            value={jdText}
            onChange={setJdText}
            rows={10}
            error={errors.jdText}
          />
        )}

        {activeTab === "upload" && (
          <FileUpload
            accept=".pdf,.docx,.txt"
            file={jdFile}
            onFileSelect={setJdFile}
            error={errors.jdFile}
          />
        )}

        {activeTab === "url" && (
          <div className="space-y-1">
            <input
              type="url"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.jdUrl ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://boards.greenhouse.io/..."
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
            />
            {errors.jdUrl && <p className="text-sm text-red-600">{errors.jdUrl}</p>}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Set Job Description
      </button>

      {(jdText || jdFile || jdUrl) && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            {activeTab === "paste" && `JD set: ${jdText.length} characters`}
            {activeTab === "upload" && `JD set: ${jdFile.name}`}
            {activeTab === "url" && `JD set: ${jdUrl}`}
          </p>
        </div>
      )}
    </div>
  )
}
