"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import { AlertCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { DuplicatePasswordGroup, DuplicatePinGroup } from "@/lib/utils/duplicates"
import { deletePassword } from "@/lib/firebase/passwords"
import { deletePin } from "@/lib/firebase/pins"
import { formatDistanceToNow } from "date-fns"

interface DuplicateCleanupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  passwordDuplicates: DuplicatePasswordGroup[]
  pinDuplicates: DuplicatePinGroup[]
  userId: string
  onCleanupComplete: () => void
}

export function DuplicateCleanupDialog({
  open,
  onOpenChange,
  passwordDuplicates,
  pinDuplicates,
  userId,
  onCleanupComplete,
}: DuplicateCleanupDialogProps) {
  const [cleaning, setCleaning] = useState(false)
  const [selectedPasswordIds, setSelectedPasswordIds] = useState<Set<string>>(new Set())
  const [selectedPinIds, setSelectedPinIds] = useState<Set<string>>(new Set())

  // Automatically select older duplicates to keep
  const handleSelectAllOldest = () => {
    const pwdIds = new Set<string>()
    const pinIds = new Set<string>()

    // For each group, select all but the newest (which we keep)
    passwordDuplicates.forEach((group) => {
      group.entries.slice(1).forEach((e) => pwdIds.add(e.id))
    })

    pinDuplicates.forEach((group) => {
      group.entries.slice(1).forEach((e) => pinIds.add(e.id))
    })

    setSelectedPasswordIds(pwdIds)
    setSelectedPinIds(pinIds)
  }

  const togglePasswordId = (id: string) => {
    const newSet = new Set(selectedPasswordIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedPasswordIds(newSet)
  }

  const togglePinId = (id: string) => {
    const newSet = new Set(selectedPinIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedPinIds(newSet)
  }

  const onCleanup = async () => {
    if (selectedPasswordIds.size === 0 && selectedPinIds.size === 0) {
      toast.error("Select at least one item to delete")
      return
    }

    setCleaning(true)
    try {
      // Delete selected passwords
      for (const id of selectedPasswordIds) {
        await deletePassword(userId, id)
      }

      // Delete selected pins
      for (const id of selectedPinIds) {
        await deletePin(userId, id)
      }

      const totalDeleted = selectedPasswordIds.size + selectedPinIds.size
      toast.success(`Deleted ${totalDeleted} duplicate entries`)
      onCleanupComplete()
      onOpenChange(false)
    } catch (err) {
      toast.error("Failed to delete duplicates")
      console.error("[v0] Cleanup error:", err)
    } finally {
      setCleaning(false)
    }
  }

  const totalPasswordDuplicates = passwordDuplicates.reduce((sum, g) => sum + (g.count - 1), 0)
  const totalPinDuplicates = pinDuplicates.reduce((sum, g) => sum + (g.count - 1), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Clean up duplicates</DialogTitle>
          <DialogDescription>
            Found {totalPasswordDuplicates + totalPinDuplicates} duplicate entries across your vault
          </DialogDescription>
        </DialogHeader>

        {passwordDuplicates.length === 0 && pinDuplicates.length === 0 ? (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>No duplicates found in your vault.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {passwordDuplicates.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Duplicate Passwords ({totalPasswordDuplicates})
                  </h3>
                </div>
                <div className="space-y-2">
                  {passwordDuplicates.map((group) => (
                    <Card key={group.key} className="p-3">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">
                        {group.entries[0].email || group.entries[0].username}
                      </div>
                      <div className="space-y-1">
                        {group.entries.map((entry, idx) => (
                          <label
                            key={entry.id}
                            className="flex items-start gap-3 rounded px-2 py-1 hover:bg-accent"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPasswordIds.has(entry.id)}
                              onChange={() => togglePasswordId(entry.id)}
                              disabled={idx === 0} // Keep the newest
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm">
                                {entry.siteName}
                                {idx === 0 && <Badge className="ml-2">Keep (newest)</Badge>}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {entry.createdAt
                                  ? formatDistanceToNow(entry.createdAt, { addSuffix: true })
                                  : "Unknown date"}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pinDuplicates.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Duplicate PINs ({totalPinDuplicates})</h3>
                </div>
                <div className="space-y-2">
                  {pinDuplicates.map((group) => (
                    <Card key={group.key} className="p-3">
                      <div className="mb-2 text-sm font-medium text-muted-foreground font-mono">
                        {group.key}
                      </div>
                      <div className="space-y-1">
                        {group.entries.map((entry, idx) => (
                          <label
                            key={entry.id}
                            className="flex items-start gap-3 rounded px-2 py-1 hover:bg-accent"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPinIds.has(entry.id)}
                              onChange={() => togglePinId(entry.id)}
                              disabled={idx === 0} // Keep the newest
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm">
                                {entry.label}
                                {idx === 0 && <Badge className="ml-2">Keep (newest)</Badge>}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {entry.createdAt
                                  ? formatDistanceToNow(entry.createdAt, { addSuffix: true })
                                  : "Unknown date"}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                The newest entry in each group is kept by default. You can manually select
                others to delete.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {(passwordDuplicates.length > 0 || pinDuplicates.length > 0) && (
          <DialogFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSelectAllOldest()}
              disabled={cleaning}
            >
              Auto-select oldest
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={cleaning}
            >
              Cancel
            </Button>
            <Button
              onClick={onCleanup}
              disabled={
                cleaning || (selectedPasswordIds.size === 0 && selectedPinIds.size === 0)
              }
              className="gap-2"
              variant="destructive"
            >
              {cleaning && <Spinner className="size-4" />}
              Delete {selectedPasswordIds.size + selectedPinIds.size} items
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
