export const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api"

export function getTimezone(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  return ""
}

export async function trackView(slug: string): Promise<void> {
  try {
    await fetch(`${BACKEND_API_URL}/analytics/view/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: getTimezone() }),
    })
  } catch (error) {
    console.error("Failed to track view:", error)
  }
}

export async function trackClick(slug: string): Promise<void> {
  try {
    await fetch(`${BACKEND_API_URL}/analytics/click/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: getTimezone() }),
    })
  } catch (error) {
    console.error("Failed to track click:", error)
  }
}
