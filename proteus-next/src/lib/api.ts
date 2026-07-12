const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "";

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.detail || data.error || `Request failed: ${res.status}`;
    if (res.status === 401) throw new Error("Authentication required — please sign in again");
    if (res.status === 403) throw new Error("You don't have access to this resource");
    if (res.status === 404) throw new Error("The requested resource was not found");
    if (res.status === 503) throw new Error("Service temporarily unavailable — try again in a moment");
    throw new Error(msg);
  }
  return res.json();
}

export async function apiPost(path: string, body: FormData | object) {
  const isFormData = body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: isFormData ? body : JSON.stringify(body),
    ...(!isFormData && { headers: { "Content-Type": "application/json" } }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.detail || data.error || `Request failed: ${res.status}`;
    if (res.status === 401) throw new Error("Authentication required — please sign in again");
    if (res.status === 429) throw new Error(data.message || "Daily limit reached — try again tomorrow");
    if (res.status === 503) throw new Error("Service temporarily unavailable — try again in a moment");
    throw new Error(msg);
  }
  return res.json();
}

export async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.detail || data.error || `Request failed: ${res.status}`;
    if (res.status === 401) throw new Error("Authentication required — please sign in again");
    if (res.status === 403) throw new Error("You don't have access to this resource");
    if (res.status === 404) throw new Error("The requested resource was not found");
    throw new Error(msg);
  }
  return res.json();
}

export async function apiPostStream(
  path: string,
  body: FormData,
  onEvent: (event: Record<string, unknown>) => void
) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        try {
          onEvent(JSON.parse(line));
        } catch {
          // Skip malformed lines
        }
      }
    }
  }
}
