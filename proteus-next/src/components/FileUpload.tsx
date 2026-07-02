"use client";

import { useRef } from "react";

export function FileUpload({
  accept,
  file,
  onFileSelect,
  onFileRemove,
  error,
}: {
  accept: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1px dashed ${error ? "#dc3545" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          background: "var(--surface-sunken)",
          padding: file ? "16px 20px" : "40px 20px",
          cursor: "pointer",
          textAlign: "center",
          transition: "all .15s ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) onFileSelect(selected);
          }}
        />
        {file ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}>&#128196;</span>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "13.5px", color: "var(--text)" }}>{file.name}</p>
                <p style={{ fontSize: "11.5px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-soft)",
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
              }}
            >
              &times;
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "13.5px", color: "var(--text-soft)" }}>
              Drag & drop or click to upload
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
              {accept}
            </p>
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: "13px", color: "#ff6b6b", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}
