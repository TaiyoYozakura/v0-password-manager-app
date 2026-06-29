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
import type { EncryptedPinDoc, DecryptedPinEntry } from "../types"
import { decryptString, encryptString, integrityHash } from "../crypto/encryption"
import type CryptoJS from "crypto-js"

function pinsCol(uid: string) {
  const { db } = getFirebase()
  return collection(db, "users", uid, "pins")
}

export async function listPins(
  uid: string,
  key: CryptoJS.lib.WordArray,
): Promise<DecryptedPinEntry[]> {
  const q = query(pinsCol(uid), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  const results: DecryptedPinEntry[] = []
  snap.forEach((d) => {
    const data = d.data() as EncryptedPinDoc
    const pin = decryptString(data.encryptedPin, key)
    const notes = decryptString(data.encryptedNotes, key)
    results.push({
      id: d.id,
      label: data.label || "",
      category: data.category || "Other",
      pin,
      notes,
      integrityOk: integrityHash(pin, key) === data.integrityHash,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    })
  })
  return results
}

export async function getPin(
  uid: string,
  id: string,
  key: CryptoJS.lib.WordArray,
): Promise<DecryptedPinEntry | null> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "pins", id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() as EncryptedPinDoc
  const pin = decryptString(data.encryptedPin, key)
  const notes = decryptString(data.encryptedNotes, key)
  return {
    id: snap.id,
    label: data.label || "",
    category: data.category || "Other",
    pin,
    notes,
    integrityOk: integrityHash(pin, key) === data.integrityHash,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
  }
}

export interface PinInput {
  label: string
  category: string
  pin: string
  notes: string
}

function buildPayload(input: PinInput, key: CryptoJS.lib.WordArray) {
  return {
    encryptedPin: encryptString(input.pin, key),
    encryptedNotes: encryptString(input.notes, key),
    integrityHash: integrityHash(input.pin, key),
    label: input.label,
    category: input.category || "Other",
  }
}

export async function createPin(
  uid: string,
  input: PinInput,
  key: CryptoJS.lib.WordArray,
): Promise<string> {
  const ref = await addDoc(pinsCol(uid), {
    ...buildPayload(input, key),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePin(
  uid: string,
  id: string,
  input: PinInput,
  key: CryptoJS.lib.WordArray,
): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "pins", id)
  await updateDoc(ref, {
    ...buildPayload(input, key),
    updatedAt: serverTimestamp(),
  })
}

export async function deletePin(uid: string, id: string): Promise<void> {
  const { db } = getFirebase()
  await deleteDoc(doc(db, "users", uid, "pins", id))
}

export async function deleteAllPins(uid: string): Promise<void> {
  const { db } = getFirebase()
  const snap = await getDocs(pinsCol(uid))
  const batch = writeBatch(db)
  snap.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}
