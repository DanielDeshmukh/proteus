export function Toast({ message, type = "info", onClose }) {
  const types = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  }
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${types[type]}`}>
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-current opacity-50 hover:opacity-100">
          &times;
        </button>
      )}
    </div>
  )
}
