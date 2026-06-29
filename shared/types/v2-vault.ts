import { z } from "zod"

// Vault Item Types

export const PasswordItemSchema = z.object({
  id: z.string(),
  siteName: z.string(),
  siteUrl: z.string().url().optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  favorite: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastUsed: z.number().optional(),
})

export type PasswordItem = z.infer<typeof PasswordItemSchema>

export const PINItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  pin: z.string(),
  category: z.enum(["bank", "credit-card", "phone", "home", "work", "other"]).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  favorite: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type PINItem = z.infer<typeof PINItemSchema>

export const NoteItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  favorite: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type NoteItem = z.infer<typeof NoteItemSchema>

// Vault Structure

export const VaultDataSchema = z.object({
  version: z.literal(2),
  masterPasswordHash: z.string(), // Argon2id hash for verification
  passwords: z.array(PasswordItemSchema),
  pins: z.array(PINItemSchema),
  notes: z.array(NoteItemSchema),
  lastSyncedAt: z.number(),
  deviceId: z.string(),
})

export type VaultData = z.infer<typeof VaultDataSchema>

// Session & Auth

export const SessionSchema = z.object({
  userId: z.string(),
  deviceId: z.string(),
  sessionToken: z.string(),
  encryptionKeyHash: z.string(), // Hash of the derived key for quick verification
  createdAt: z.number(),
  expiresAt: z.number(),
  isQuickUnlock: z.boolean().default(false),
})

export type Session = z.infer<typeof SessionSchema>

// Sync Events

export const SyncEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  timestamp: z.number(),
  action: z.enum(["create", "update", "delete"]),
  itemType: z.enum(["password", "pin", "note"]),
  itemId: z.string(),
  data: z.record(z.any()).optional(),
})

export type SyncEvent = z.infer<typeof SyncEventSchema>

// Activity Log

export const ActivityLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  timestamp: z.number(),
  action: z.string(),
  deviceId: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  result: z.enum(["success", "failure"]),
  details: z.record(z.any()).optional(),
})

export type ActivityLog = z.infer<typeof ActivityLogSchema>
