import { useState } from "react"
import { Tabs } from "./Tabs"
import { TextArea } from "./TextArea"
import { FileUpload } from "./FileUpload"

const tabs = [
  { id: "paste", label: "Paste Text" },
  { id: "upload", label: "Upload File" },
]

export function ResumeInput({ onResumeReady }) {
  const [activeTab, setActiveTab] = useState("paste")
  const [resumeText, setResumeText] = useState("")
  const [resumeFile, setResumeFile] = useState(null)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (activeTab === "paste" && !resumeText.trim()) {
      newErrors.resumeText = "Please enter your resume text"
    }
    if (activeTab === "upload" && !resumeFile) {
      newErrors.resumeFile = "Please upload a file"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (activeTab === "paste") {
      onResumeReady({ type: "text", value: resumeText })
    } else {
      onResumeReady({ type: "file", value: resumeFile })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Resume</h3>
        <p className="text-sm text-gray-500">Paste text or upload a PDF/DOCX</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pt-2">
        {activeTab === "paste" && (
          <TextArea
            placeholder="Paste your resume content here..."
            value={resumeText}
            onChange={setResumeText}
            rows={10}
            error={errors.resumeText}
          />
        )}

        {activeTab === "upload" && (
          <FileUpload
            accept=".pdf,.docx,.txt"
            file={resumeFile}
            onFileSelect={setResumeFile}
            error={errors.resumeFile}
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Set Resume
      </button>

      {(resumeText || resumeFile) && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            {activeTab === "paste" && `Resume set: ${resumeText.length} characters`}
            {activeTab === "upload" && `Resume set: ${resumeFile.name}`}
          </p>
        </div>
      )}
    </div>
  )
}
