import { describe, it, expect, vi, beforeEach } from 'vitest'

const API_BASE = import.meta.env.VITE_API_URL || ''

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('apiGet', () => {
  it('returns JSON on success', async () => {
    const { apiGet } = await import('./api')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok' }),
    }))
    const data = await apiGet('/api/health')
    expect(data).toEqual({ status: 'ok' })
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/health`)
  })

  it('throws on non-ok response', async () => {
    const { apiGet } = await import('./api')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: 'Not found' }),
    }))
    await expect(apiGet('/api/missing')).rejects.toThrow('Not found')
  })

  it('throws generic error when no detail', async () => {
    const { apiGet } = await import('./api')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    }))
    await expect(apiGet('/api/error')).rejects.toThrow('Request failed: 500')
  })
})

describe('apiPost', () => {
  it('sends POST request with body', async () => {
    const { apiPost } = await import('./api')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ run_id: 1 }),
    }))
    const body = new FormData()
    body.append('jd_text', 'test')
    const data = await apiPost('/api/analyze', body)
    expect(data).toEqual({ run_id: 1 })
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/analyze`, { method: 'POST', body })
  })

  it('throws on error', async () => {
    const { apiPost } = await import('./api')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: 'Bad request' }),
    }))
    await expect(apiPost('/api/analyze', new FormData())).rejects.toThrow('Bad request')
  })
})

describe('apiDelete', () => {
  it('sends DELETE request', async () => {
    const { apiDelete } = await import('./api')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ deleted: true }),
    }))
    const data = await apiDelete('/api/history/1')
    expect(data).toEqual({ deleted: true })
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/history/1`, { method: 'DELETE' })
  })
})

describe('apiPostStream', () => {
  it('parses NDJSON stream and calls onEvent', async () => {
    const { apiPostStream } = await import('./api')
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('{"event":"started","run_id":1}\n'))
        controller.enqueue(encoder.encode('{"event":"done","run_id":1}\n'))
        controller.close()
      },
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => stream.getReader() },
    }))

    const events = []
    await apiPostStream('/api/analyze/stream', new FormData(), (e) => events.push(e))
    expect(events).toHaveLength(2)
    expect(events[0].event).toBe('started')
    expect(events[1].event).toBe('done')
  })

  it('throws on non-ok response', async () => {
    const { apiPostStream } = await import('./api')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: 'jd_text required' }),
    }))
    await expect(
      apiPostStream('/api/analyze/stream', new FormData(), () => {})
    ).rejects.toThrow('jd_text required')
  })
})
