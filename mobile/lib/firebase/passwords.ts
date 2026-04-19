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
import { scorePassword } from "../crypto/passwordStrength"
import type { PasswordEntry, PasswordTag } from "../types"

const colRef = (uid: string) => collection(db, "users", uid, "passwords")

export type PasswordInput = {
  title: string
  email?: string
  username?: string
  siteUrl?: string
  password: string
  notes?: string
  tag: PasswordTag
}

export async function listPasswords(uid: string): Promise<PasswordEntry[]> {
  const q = query(colRef(uid), orderBy("updatedAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PasswordEntry, "id">) }))
}

export async function getPassword(uid: string, id: string) {
  const snap = await getDoc(doc(db, "users", uid, "passwords", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<PasswordEntry, "id">) }
}

export async function createPassword(
  uid: string,
  input: PasswordInput,
  masterKey: CryptoJS.lib.WordArray,
) {
  const now = Date.now()
  const data: Omit<PasswordEntry, "id"> = {
    title: input.title.trim(),
    email: input.email?.trim() || undefined,
    username: input.username?.trim() || undefined,
    siteUrl: input.siteUrl?.trim() || undefined,
    password: encryptField(input.password, masterKey),
    notes: input.notes ? encryptField(input.notes, masterKey) : undefined,
    tag: input.tag,
    createdAt: now,
    updatedAt: now,
    passwordStrength: scorePassword(input.password),
  }
  const ref = await addDoc(colRef(uid), data)
  return ref.id
}

export async function updatePassword(
  uid: string,
  id: string,
  input: PasswordInput,
  masterKey: CryptoJS.lib.WordArray,
) {
  const data: Partial<PasswordEntry> = {
    title: input.title.trim(),
    email: input.email?.trim() || undefined,
    username: input.username?.trim() || undefined,
    siteUrl: input.siteUrl?.trim() || undefined,
    password: encryptField(input.password, masterKey),
    notes: input.notes ? encryptField(input.notes, masterKey) : undefined,
    tag: input.tag,
    updatedAt: Date.now(),
    passwordStrength: scorePassword(input.password),
  }
  await updateDoc(doc(db, "users", uid, "passwords", id), data as Record<string, unknown>)
}

export async function deletePassword(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "passwords", id))
}
