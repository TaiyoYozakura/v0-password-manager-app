/**
 * Favicon fetching utility for custom tags
 * Fetches and converts website favicons to data URLs for storage
 */

export interface FaviconResult {
  dataUrl: string | null
  error?: string
}

/**
 * Fetch favicon from a website and convert to data URL
 * Uses multiple fallback methods to find and retrieve the favicon
 */
export async function fetchFavicon(urlString: string): Promise<FaviconResult> {
  try {
    // Validate and normalize URL
    let url: URL
    try {
      url = new URL(urlString.startsWith("http") ? urlString : `https://${urlString}`)
    } catch {
      return { dataUrl: null, error: "Invalid URL" }
    }

    const domain = url.hostname

    // Try multiple favicon sources in order of preference
    const faviconUrls = [
      // 1. Try favicon.ico at root
      `https://${domain}/favicon.ico`,
      // 2. Try common favicon services
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      `https://icon.horse/icon/${domain}`,
    ]

    for (const faviconUrl of faviconUrls) {
      const dataUrl = await fetchAndConvertToDataUrl(faviconUrl)
      if (dataUrl) {
        return { dataUrl }
      }
    }

    return { dataUrl: null, error: "Unable to fetch favicon from any source" }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { dataUrl: null, error: message }
  }
}

/**
 * Fetch an image and convert it to a data URL
 */
async function fetchAndConvertToDataUrl(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      mode: "no-cors",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) return null

    const blob = await response.blob()
    if (blob.size === 0) return null

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        // Validate that we got a valid image data URL
        if (dataUrl && dataUrl.startsWith("data:")) {
          resolve(dataUrl)
        } else {
          resolve(null)
        }
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Validate if a data URL is a valid image
 */
export function isValidImageDataUrl(dataUrl: string): boolean {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return false
  }

  // Check basic data URL structure
  const parts = dataUrl.split(",")
  return parts.length === 2 && parts[1].length > 0
}

/**
 * Compress image data URL if needed (limit to ~500KB for storage)
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxSize: number = 500000
): Promise<string> {
  // If already small enough, return as is
  if (dataUrl.length <= maxSize) {
    return dataUrl
  }

  try {
    return await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img

        // Scale down if too large
        const maxDimension = 128
        if (width > maxDimension || height > maxDimension) {
          const scale = Math.min(maxDimension / width, maxDimension / height)
          width = Math.floor(width * scale)
          height = Math.floor(height * scale)
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const compressed = canvas.toDataURL("image/png", 0.7)
          resolve(compressed.length <= maxSize ? compressed : dataUrl)
        } else {
          resolve(dataUrl)
        }
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    })
  } catch {
    return dataUrl
  }
}
