export function FileUpload({ label, accept, onFileSelect, onFileRemove, file, error }) {
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileSelect(droppedFile);
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) onFileSelect(selectedFile);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {label && (
        <label style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--text-soft)" }}>
          {label}
        </label>
      )}
      <div
        style={{
          border: `1px dashed ${error ? "#dc3545" : "var(--border-strong)"}`,
          borderRadius: "var(--radius-md)",
          background: "var(--surface-sunken)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          color: "var(--text-soft)",
          fontSize: "13px",
          padding: "40px 20px",
          cursor: "pointer",
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById(`file-input-${accept}`).click()}
      >
        <input
          id={`file-input-${accept}`}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {file ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "7px",
                  background: "rgba(201, 169, 98, 0.12)",
                  color: "var(--color-gold-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
                  {file.name}
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
            <span
              style={{ color: "var(--text-faint)", cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </span>
          </div>
        ) : (
          <>
            <span style={{ color: "var(--color-gold)" }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </span>
            <span>
              Drag & drop or{" "}
              <strong style={{ color: "var(--text)", fontWeight: 500 }}>click to upload</strong>
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-faint)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {accept}
            </span>
          </>
        )}
      </div>
      {error && <p style={{ fontSize: "13px", color: "#ff6b6b" }}>{error}</p>}
    </div>
  );
}
