import { useState } from "react"

export function CoverLetterDisplay({ coverLetter }) {
  const [copied, setCopied] = useState(false)

  if (!coverLetter) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter.full_letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {coverLetter.word_count} words | {coverLetter.tone}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
          {coverLetter.full_letter}
        </pre>
      </div>

      {coverLetter.key_points_addressed && coverLetter.key_points_addressed.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {coverLetter.key_points_addressed.map((point, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {point}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
