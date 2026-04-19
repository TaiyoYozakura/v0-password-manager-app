import CryptoJS from "crypto-js"
import * as Crypto from "expo-crypto"
import type { EncryptedField } from "../types"

// Mirrors the web app: PBKDF2(SHA-256, 100k iters) -> AES-CBC with random IV+salt per field.
// Vaults remain interoperable across web and mobile.

const ITERATIONS = 100_000
const KEY_SIZE = 256 / 32

function bytesToWordArray(bytes: Uint8Array) {
  const words: number[] = []
  for (let i = 0; i < bytes.length; i++) {
    words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8)
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length)
}

function randomWordArray(byteLength: number) {
  const bytes = Crypto.getRandomBytes(byteLength)
  return bytesToWordArray(bytes)
}

export function deriveKey(uid: string, pin: string, saltHex: string) {
  const salt = CryptoJS.enc.Hex.parse(saltHex)
  return CryptoJS.PBKDF2(`${uid}:${pin}`, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  })
}

export function deriveMasterSalt(uid: string) {
  return CryptoJS.SHA256(`vault-master-salt:${uid}`).toString(CryptoJS.enc.Hex)
}

export function deriveMasterKey(uid: string, pin: string) {
  return deriveKey(uid, pin, deriveMasterSalt(uid))
}

export function encryptField(plaintext: string, masterKey: CryptoJS.lib.WordArray): EncryptedField {
  const iv = randomWordArray(16)
  const salt = randomWordArray(16)
  const ciphertext = CryptoJS.AES.encrypt(plaintext, masterKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString()
  return {
    ciphertext,
    iv: iv.toString(CryptoJS.enc.Hex),
    salt: salt.toString(CryptoJS.enc.Hex),
  }
}

export function decryptField(field: EncryptedField, masterKey: CryptoJS.lib.WordArray): string {
  const iv = CryptoJS.enc.Hex.parse(field.iv)
  const bytes = CryptoJS.AES.decrypt(field.ciphertext, masterKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function makePinSalt() {
  return randomWordArray(16).toString(CryptoJS.enc.Hex)
}

export function pinVerifier(pin: string, saltHex: string) {
  const salt = CryptoJS.enc.Hex.parse(saltHex)
  return CryptoJS.PBKDF2(`verify:${pin}`, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  }).toString(CryptoJS.enc.Hex)
}
