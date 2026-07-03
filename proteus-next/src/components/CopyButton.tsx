"use client";

import { useState } from "react";
import { FaCopy } from "react-icons/fa6";
import { MdFileDownloadDone } from "react-icons/md";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: copied ? "rgba(34, 197, 94, 0.12)" : "var(--surface-sunken)",
        border: `1px solid ${copied ? "rgba(34, 197, 94, 0.3)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        color: copied ? "#22c55e" : "var(--text-soft)",
        padding: "6px 12px",
        fontSize: "12px",
        fontFamily: "var(--font-sans)",
        cursor: "pointer",
        transition: "all .2s ease",
        position: "relative",
      }}
    >
      {copied ? (
        <>
          <MdFileDownloadDone size={14} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <FaCopy size={13} />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
