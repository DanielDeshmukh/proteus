import { useState } from "react"
import { Tabs } from "./Tabs"
import { TextArea } from "./TextArea"
import { FileUpload } from "./FileUpload"

const tabs = [
  { id: "paste", label: "Paste" },
  { id: "upload", label: "Upload" },
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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "17px", letterSpacing: "0.01em", color: "var(--text)" }}>
          Resume
        </h2>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div style={{ padding: "0" }}>
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0",
          fontFamily: "var(--font-mono)",
          fontSize: "11.5px",
          color: "var(--text-faint)",
        }}
      >
        {(resumeText || resumeFile) && (
          <>
            <span>Extracted</span>
            <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--text-faint)" }} />
            <span style={{ color: "var(--color-gold-light)" }}>
              {activeTab === "paste" && `${resumeText.length} characters`}
              {activeTab === "upload" && resumeFile?.name}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
