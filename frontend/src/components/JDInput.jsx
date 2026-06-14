import { useState, useEffect } from "react"
import { Tabs } from "./Tabs"
import { TextArea } from "./TextArea"
import { FileUpload } from "./FileUpload"

const tabs = [
  { id: "paste", label: "Paste" },
  { id: "upload", label: "Upload" },
  { id: "url", label: "URL" },
]

export function JDInput({ onJDReady }) {
  const [activeTab, setActiveTab] = useState("paste")
  const [jdText, setJdText] = useState("")
  const [jdFile, setJdFile] = useState(null)
  const [jdUrl, setJdUrl] = useState("")
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (activeTab === "paste" && jdText.trim()) {
      onJDReady({ type: "text", value: jdText })
    } else if (activeTab === "upload" && jdFile) {
      onJDReady({ type: "file", value: jdFile })
    } else if (activeTab === "url" && jdUrl.trim() && jdUrl.startsWith("http")) {
      onJDReady({ type: "url", value: jdUrl })
    }
  }, [activeTab, jdText, jdFile, jdUrl])

  useEffect(() => {
    onJDReady(null)
  }, [activeTab])

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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "17px", letterSpacing: "0.01em", color: "var(--text)" }}>
          Job description
        </h2>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div style={{ padding: "0" }}>
        {activeTab === "paste" && (
          <TextArea
            placeholder="Paste the job description..."
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
            onFileRemove={() => setJdFile(null)}
            error={errors.jdFile}
          />
        )}

        {activeTab === "url" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <input
              type="url"
              style={{
                width: "100%",
                background: "var(--surface-sunken)",
                border: `1px solid ${errors.jdUrl ? "#dc3545" : "var(--border)"}`,
                borderRadius: "var(--radius-md)",
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
                fontSize: "13.5px",
                padding: "12px 16px",
              }}
              placeholder="https://boards.greenhouse.io/..."
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
            />
            {errors.jdUrl && <p style={{ fontSize: "13px", color: "#ff6b6b" }}>{errors.jdUrl}</p>}
          </div>
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
        {(jdText || jdFile || jdUrl) && (
          <>
            <span>Parsed</span>
            <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--text-faint)" }} />
            <span style={{ color: "var(--color-gold-light)" }}>
              {activeTab === "paste" && `${jdText.length} characters`}
              {activeTab === "upload" && jdFile?.name}
              {activeTab === "url" && jdUrl}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
