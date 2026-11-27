import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore"
import type CryptoJS from "crypto-js"
import { getFirebase } from "./config"
import { decryptString, encryptString, integrityHash } from "../crypto/encryption"
import type { Timestamp as FirestoreTimestamp } from "firebase/firestore"

export interface EmailIdentity {
  id: string
  name: string
  email: string
  category: string
  notes: string
  integrityOk: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface EmailIdentityInput {
  name: string
  email: string
  category: string
  notes: string
}

interface EncryptedEmailIdentity {
  encryptedName: string
  encryptedEmail: string
  encryptedCategory: string
  encryptedNotes: string
  integrityHash: string
  createdAt: FirestoreTimestamp | null
  updatedAt: FirestoreTimestamp | null
}

function identitiesCol(uid: string) {
  const { db } = getFirebase()
  return collection(db, "users", uid, "emailIdentities")
}

function buildPayload(input: EmailIdentityInput, key: CryptoJS.lib.WordArray) {
  const values = [input.name, input.email, input.category, input.notes]
  return {
    encryptedName: encryptString(input.name, key),
    encryptedEmail: encryptString(input.email, key),
    encryptedCategory: encryptString(input.category, key),
    encryptedNotes: encryptString(input.notes, key),
    integrityHash: integrityHash(JSON.stringify(values), key),
  }
}

function decryptIdentity(id: string, data: EncryptedEmailIdentity, key: CryptoJS.lib.WordArray): EmailIdentity {
  const name = decryptString(data.encryptedName, key)
  const email = decryptString(data.encryptedEmail, key)
  const category = decryptString(data.encryptedCategory, key)
  const notes = decryptString(data.encryptedNotes, key)
  const integrityOk = integrityHash(JSON.stringify([name, email, category, notes]), key) === data.integrityHash
  return {
    id,
    name,
    email,
    category,
    notes,
    integrityOk,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
  }
}

export async function listEmailIdentities(uid: string, key: CryptoJS.lib.WordArray): Promise<EmailIdentity[]> {
  const snapshot = await getDocs(query(identitiesCol(uid), orderBy("createdAt", "desc")))
  return snapshot.docs.map((item) => decryptIdentity(item.id, item.data() as EncryptedEmailIdentity, key))
}

export async function createEmailIdentity(
  uid: string,
  input: EmailIdentityInput,
  key: CryptoJS.lib.WordArray,
): Promise<string> {
  const created = await addDoc(identitiesCol(uid), {
    ...buildPayload(input, key),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return created.id
}

export async function updateEmailIdentity(
  uid: string,
  id: string,
  input: EmailIdentityInput,
  key: CryptoJS.lib.WordArray,
): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, "users", uid, "emailIdentities", id), {
    ...buildPayload(input, key),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteEmailIdentity(uid: string, id: string): Promise<void> {
  const { db } = getFirebase()
  const related = await getDocs(query(collection(db, "users", uid, "passwords"), where("emailIdentityId", "==", id)))
  for (let start = 0; start < related.docs.length; start += 450) {
    const batch = writeBatch(db)
    related.docs.slice(start, start + 450).forEach((password) => batch.update(password.ref, { emailIdentityId: deleteField() }))
    await batch.commit()
  }
  await deleteDoc(doc(db, "users", uid, "emailIdentities", id))
}
