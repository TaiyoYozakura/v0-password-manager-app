"use client"

import { use } from "react"
import { PinForm } from "@/components/vault/pin-form"

export default function EditPinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PinForm mode="edit" id={id} />
}
