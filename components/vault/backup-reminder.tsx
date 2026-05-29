"use client"

import { AlertCircle, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface BackupReminderProps {
  onExportClick: () => void
  daysSinceBackup?: number
}

export function BackupReminder({ onExportClick, daysSinceBackup }: BackupReminderProps) {
  if (!daysSinceBackup || daysSinceBackup < 30) {
    return null
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
      <AlertCircle className="size-4" aria-hidden />
      <AlertTitle>Time to backup your vault</AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between">
        <span>
          It's been {daysSinceBackup} days since your last backup. Download an encrypted copy of your passwords and PINs.
        </span>
        <Button
          onClick={onExportClick}
          size="sm"
          variant="outline"
          className="ml-2 gap-2 whitespace-nowrap border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800"
        >
          <Download className="size-4" aria-hidden />
          Download backup
        </Button>
      </AlertDescription>
    </Alert>
  )
}
