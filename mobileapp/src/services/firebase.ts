import {
  initializeApp,
  getApp,
  FirebaseApp,
} from 'firebase/app'
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

export function initializeFirebase() {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig)
      auth = getAuth(app)
      db = getFirestore(app)
    }
    return { app, auth, db }
  } catch (error) {
    console.error('[v0] Firebase initialization failed:', error)
    throw error
  }
}

export function getFirebaseApp() {
  if (!app) {
    initializeFirebase()
  }
  return app!
}

export function getFirebaseAuth() {
  if (!auth) {
    initializeFirebase()
  }
  return auth!
}

export function getFirebaseDb() {
  if (!db) {
    initializeFirebase()
  }
  return db!
}

export async function signInWithGoogle(idToken: string) {
  const auth = getFirebaseAuth()
  const credential = GoogleAuthProvider.credential(idToken)
  return await signInWithCredential(auth, credential)
}

export async function signOut() {
  const auth = getFirebaseAuth()
  return await firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}

export async function getUserProfile(uid: string) {
  const db = getFirebaseDb()
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? docSnap.data() : null
}

export async function updateUserProfile(uid: string, data: any) {
  const db = getFirebaseDb()
  const docRef = doc(db, 'users', uid)
  return await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function createPassword(uid: string, passwordData: any) {
  const db = getFirebaseDb()
  const docRef = doc(db, 'users', uid, 'passwords', passwordData.id)
  return await setDoc(docRef, {
    ...passwordData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}

export async function updatePassword(uid: string, passwordId: string, data: any) {
  const db = getFirebaseDb()
  const docRef = doc(db, 'users', uid, 'passwords', passwordId)
  return await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function deletePassword(uid: string, passwordId: string) {
  const db = getFirebaseDb()
  const docRef = doc(db, 'users', uid, 'passwords', passwordId)
  return await deleteDoc(docRef)
}

export async function getPasswords(uid: string) {
  const db = getFirebaseDb()
  const q = query(collection(db, 'users', uid, 'passwords'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export async function getPinsByTag(uid: string, tag: string) {
  const db = getFirebaseDb()
  const q = query(
    collection(db, 'users', uid, 'pins'),
    where('tag', '==', tag),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export async function createPin(uid: string, pinData: any) {
  const db = getFirebaseDb()
  const docRef = doc(db, 'users', uid, 'pins', pinData.id)
  return await setDoc(docRef, {
    ...pinData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}

export async function deletePin(uid: string, pinId: string) {
  const db = getFirebaseDb()
  const docRef = doc(db, 'users', uid, 'pins', pinId)
  return await deleteDoc(docRef)
}
