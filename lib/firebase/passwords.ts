import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
  Timestamp,
} from "firebase/firestore"
import { getFirebase } from "./config"
import type { EncryptedPasswordDoc, DecryptedPasswordEntry } from "../types"
import { decryptString, encryptString, integrityHash } from "../crypto/encryption"
import type CryptoJS from "crypto-js"

function passwordsCol(uid: string) {
  const { db } = getFirebase()
  return collection(db, "users", uid, "passwords")
}

export async function listPasswords(
  uid: string,
  key: CryptoJS.lib.WordArray,
): Promise<DecryptedPasswordEntry[]> {
  const q = query(passwordsCol(uid), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  const results: DecryptedPasswordEntry[] = []
  snap.forEach((d) => {
    const data = d.data() as EncryptedPasswordDoc
    const password = decryptString(data.encryptedPassword, key)
    const username = decryptString(data.encryptedUsername, key)
    const email = decryptString(data.encryptedEmail, key)
    const notes = decryptString(data.encryptedNotes, key)
    const expected = integrityHash(password, key)
    results.push({
      id: d.id,
      siteName: data.siteName || "",
      siteUrl: data.siteUrl || "",
      tag: data.tag || "Other",
      password,
      username,
      email,
      notes,
      integrityOk: expected === data.integrityHash,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    })
  })
  return results
}

export async function getPassword(
  uid: string,
  id: string,
  key: CryptoJS.lib.WordArray,
): Promise<DecryptedPasswordEntry | null> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "passwords", id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() as EncryptedPasswordDoc
  const password = decryptString(data.encryptedPassword, key)
  const username = decryptString(data.encryptedUsername, key)
  const email = decryptString(data.encryptedEmail, key)
  const notes = decryptString(data.encryptedNotes, key)
  return {
    id: snap.id,
    siteName: data.siteName || "",
    siteUrl: data.siteUrl || "",
    tag: data.tag || "Other",
    password,
    username,
    email,
    notes,
    integrityOk: integrityHash(password, key) === data.integrityHash,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
  }
}

export interface PasswordInput {
  siteName: string
  siteUrl: string
  tag: string
  tagIconUrl?: string
  password: string
  username: string
  email: string
  notes: string
}

function buildEncryptedPayload(input: PasswordInput, key: CryptoJS.lib.WordArray) {
  return {
    encryptedPassword: encryptString(input.password, key),
    encryptedUsername: encryptString(input.username, key),
    encryptedEmail: encryptString(input.email, key),
    encryptedNotes: encryptString(input.notes, key),
    integrityHash: integrityHash(input.password, key),
    tag: input.tag || "Other",
    tagIconUrl: input.tagIconUrl,
    siteUrl: input.siteUrl || "",
    siteName: input.siteName,
  }
}

export async function createPassword(
  uid: string,
  input: PasswordInput,
  key: CryptoJS.lib.WordArray,
): Promise<string> {
  const ref = await addDoc(passwordsCol(uid), {
    ...buildEncryptedPayload(input, key),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePassword(
  uid: string,
  id: string,
  input: PasswordInput,
  key: CryptoJS.lib.WordArray,
): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "passwords", id)
  // Preserve createdAt; only update mutable fields + updatedAt
  await updateDoc(ref, {
    ...buildEncryptedPayload(input, key),
    updatedAt: serverTimestamp(),
  })
}

export async function deletePassword(uid: string, id: string): Promise<void> {
  const { db } = getFirebase()
  await deleteDoc(doc(db, "users", uid, "passwords", id))
}

export async function deleteAllPasswords(uid: string): Promise<void> {
  const { db } = getFirebase()
  const snap = await getDocs(passwordsCol(uid))
  const batch = writeBatch(db)
  snap.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}
