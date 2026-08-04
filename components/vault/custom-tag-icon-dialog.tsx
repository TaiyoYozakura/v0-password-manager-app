"use client"

import { useState } from "react"
import { AlertCircle, Link2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchFavicon } from "@/lib/utils/favicon"
import toast from "react-hot-toast"

interface Props {
  tagName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onIconSelected: (iconUrl: string | null) => void
}

export function CustomTagIconDialog({ tagName, open, onOpenChange, onIconSelected }: Props) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleFetchFavicon = async () => {
    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    setLoading(true)
    setError("")
    setPreview(null)

    try {
      const faviconUrl = await fetchFavicon(url)
      setPreview(faviconUrl)
      toast.success("Favicon loaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch favicon"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (!preview) {
      setError("Please fetch a favicon first")
      return
    }
    onIconSelected(preview)
    onOpenChange(false)
    setUrl("")
    setPreview(null)
    setError("")
  }

  const handleSkip = () => {
    onIconSelected(null)
    onOpenChange(false)
    setUrl("")
    setPreview(null)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Icon for "{tagName}"</DialogTitle>
          <DialogDescription>
            Enter the website URL to fetch its favicon, or skip to use a default icon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Website URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError("")
                }}
                disabled={loading}
              />
              <Button
                onClick={handleFetchFavicon}
                disabled={loading || !url.trim()}
                size="sm"
                className="gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Link2 className="size-4" />
                    Fetch
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {preview && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-4">
                <img
                  src={preview}
                  alt="Favicon preview"
                  className="size-8 rounded"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e5e7eb'/%3E%3C/svg%3E"
                  }}
                />
                <div>
                  <p className="text-sm font-medium">Icon loaded</p>
                  <p className="text-xs text-muted-foreground">Click "Use Icon" to save</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleConfirm} disabled={!preview || loading} className="flex-1">
              Use Icon
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
