"use client"

import { useCallback, useEffect, useState } from "react"
import { listEmailIdentities, type EmailIdentity } from "@/lib/firebase/email-identities"
import { listPasswordMetadata } from "@/lib/firebase/passwords"
import type { PasswordMetadataEntry } from "@/lib/types"
import { useAuth } from "@/components/providers/auth-provider"

export function useVaultData() {
  const { user, key } = useAuth()
  const [passwords, setPasswords] = useState<PasswordMetadataEntry[]>([])
  const [identities, setIdentities] = useState<EmailIdentity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [revision, setRevision] = useState(0)
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [loadedKey, setLoadedKey] = useState<typeof key>(null)

  const reload = useCallback(() => setRevision((value) => value + 1), [])

  useEffect(() => {
    if (!user || !key) {
      setPasswords([])
      setIdentities([])
      setLoadedUserId(null)
      setLoadedKey(null)
      setLoading(false)
      return
    }

    let active = true
    setPasswords([])
    setIdentities([])
    setLoadedUserId(null)
    setLoadedKey(null)
    setLoading(true)
    setError(false)
    Promise.all([listPasswordMetadata(user.uid, key), listEmailIdentities(user.uid, key)])
      .then(([nextPasswords, nextIdentities]) => {
        if (!active) return
        setPasswords(nextPasswords)
        setIdentities(nextIdentities)
        setLoadedUserId(user.uid)
        setLoadedKey(key)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user, key, revision])

  const isCurrentSession = Boolean(user && key && loadedUserId === user.uid && loadedKey === key)

  return {
    passwords: isCurrentSession ? passwords : [],
    identities: isCurrentSession ? identities : [],
    loading: loading || Boolean(user && key && !isCurrentSession),
    error: isCurrentSession && error,
    reload,
  }
}
