"use client";

import { useState, useEffect } from "react";
import { Tabs } from "./Tabs";
import { TextArea } from "./TextArea";
import { FileUpload } from "./FileUpload";

const tabs = [
  { id: "paste", label: "Paste" },
  { id: "upload", label: "Upload" },
  { id: "url", label: "URL" },
];

export function JDInput({
  onJDReady,
}: {
  onJDReady: (data: { type: "text" | "file" | "url"; value: string | File } | null) => void;
}) {
  const [activeTab, setActiveTab] = useState("paste");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdUrl, setJdUrl] = useState("");

  useEffect(() => {
    if (activeTab === "paste" && jdText.trim()) {
      onJDReady({ type: "text", value: jdText });
    } else if (activeTab === "upload" && jdFile) {
      onJDReady({ type: "file", value: jdFile });
    } else if (activeTab === "url" && jdUrl.trim() && jdUrl.startsWith("http")) {
      onJDReady({ type: "url", value: jdUrl });
    }
  }, [activeTab, jdText, jdFile, jdUrl]);

  useEffect(() => {
    onJDReady(null);
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
          Job description
        </h2>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "paste" && (
        <TextArea
          placeholder="Paste the job description..."
          value={jdText}
          onChange={setJdText}
          rows={10}
        />
      )}

      {activeTab === "upload" && (
        <FileUpload
          accept=".pdf,.docx,.txt"
          file={jdFile}
          onFileSelect={setJdFile}
          onFileRemove={() => setJdFile(null)}
        />
      )}

      {activeTab === "url" && (
        <input
          type="url"
          style={{
            width: "100%",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
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
      )}

      {(jdText || jdFile || jdUrl) && (
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
          <span>Parsed</span>
          <span
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "var(--text-faint)",
            }}
          />
          <span style={{ color: "var(--color-gold-light)" }}>
            {activeTab === "paste" && `${jdText.length} characters`}
            {activeTab === "upload" && jdFile?.name}
            {activeTab === "url" && jdUrl}
          </span>
        </div>
      )}
    </div>
  );
}
