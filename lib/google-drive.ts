export function getDriveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined

  const idMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/) ?? trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/)
  if (!idMatch) return trimmed

  return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`
}
