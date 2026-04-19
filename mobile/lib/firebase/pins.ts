import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore"
import type CryptoJS from "crypto-js"
import { db } from "./config"
import { encryptField } from "../crypto/encryption"
import type { PinCategory, PinEntry } from "../types"

const colRef = (uid: string) => collection(db, "users", uid, "pins")

export type PinInput = {
  label: string
  category: PinCategory
  value: string
  notes?: string
}

export async function listPins(uid: string): Promise<PinEntry[]> {
  const q = query(colRef(uid), orderBy("updatedAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PinEntry, "id">) }))
}

export async function getPin(uid: string, id: string) {
  const snap = await getDoc(doc(db, "users", uid, "pins", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<PinEntry, "id">) }
}

export async function createPin(
  uid: string,
  input: PinInput,
  masterKey: CryptoJS.lib.WordArray,
) {
  const now = Date.now()
  const data: Omit<PinEntry, "id"> = {
    label: input.label.trim(),
    category: input.category,
    value: encryptField(input.value, masterKey),
    notes: input.notes ? encryptField(input.notes, masterKey) : undefined,
    createdAt: now,
    updatedAt: now,
  }
  const ref = await addDoc(colRef(uid), data)
  return ref.id
}

export async function updatePin(
  uid: string,
  id: string,
  input: PinInput,
  masterKey: CryptoJS.lib.WordArray,
) {
  const data: Partial<PinEntry> = {
    label: input.label.trim(),
    category: input.category,
    value: encryptField(input.value, masterKey),
    notes: input.notes ? encryptField(input.notes, masterKey) : undefined,
    updatedAt: Date.now(),
  }
  await updateDoc(doc(db, "users", uid, "pins", id), data as Record<string, unknown>)
}

export async function deletePin(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "pins", id))
}
