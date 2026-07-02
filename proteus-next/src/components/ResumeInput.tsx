"use client";

import { useState, useEffect } from "react";
import { Tabs } from "./Tabs";
import { TextArea } from "./TextArea";
import { FileUpload } from "./FileUpload";

const tabs = [
  { id: "paste", label: "Paste" },
  { id: "upload", label: "Upload" },
];

export function ResumeInput({
  onResumeReady,
}: {
  onResumeReady: (data: { type: "text" | "file"; value: string | File } | null) => void;
}) {
  const [activeTab, setActiveTab] = useState("paste");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (activeTab === "paste" && resumeText.trim()) {
      onResumeReady({ type: "text", value: resumeText });
    } else if (activeTab === "upload" && resumeFile) {
      onResumeReady({ type: "file", value: resumeFile });
    }
  }, [activeTab, resumeText, resumeFile]);

  useEffect(() => {
    onResumeReady(null);
  }, [activeTab]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "17px",
            color: "var(--text)",
          }}
        >
          Resume
        </h2>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "paste" && (
        <TextArea
          placeholder="Paste your resume..."
          value={resumeText}
          onChange={setResumeText}
          rows={10}
        />
      )}

      {activeTab === "upload" && (
        <FileUpload
          accept=".pdf,.docx,.txt"
          file={resumeFile}
          onFileSelect={setResumeFile}
          onFileRemove={() => setResumeFile(null)}
        />
      )}

      {(resumeText || resumeFile) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "var(--font-mono)",
            fontSize: "11.5px",
            color: "var(--text-faint)",
          }}
        >
          <span>Extracted</span>
          <span
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "var(--text-faint)",
            }}
          />
          <span style={{ color: "var(--color-gold-light)" }}>
            {activeTab === "paste" && `${resumeText.length} characters`}
            {activeTab === "upload" && resumeFile?.name}
          </span>
        </div>
      )}
    </div>
  );
}
