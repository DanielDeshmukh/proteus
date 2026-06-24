const API_BASE = import.meta.env.VITE_API_URL || ""

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function apiPostStream(path, body, onEvent) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Request failed: ${res.status}`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop()
    for (const line of lines) {
      if (line.trim()) {
        onEvent(JSON.parse(line))
      }
    }
  }
  if (buffer.trim()) {
    onEvent(JSON.parse(buffer))
  }
}
