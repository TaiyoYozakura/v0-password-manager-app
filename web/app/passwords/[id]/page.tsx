"use client"

import { use } from "react"
import { PasswordForm } from "@/components/vault/password-form"

export default function EditPasswordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PasswordForm mode="edit" id={id} />
}
