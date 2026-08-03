// Jest setup file for Vaultly mobile tests
// This file is loaded before any test runs

// @ts-nocheck
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'

// Mock Firebase
jest.mock('../services/firebase', () => ({
  initializeFirebase: jest.fn(),
  getFirebaseApp: jest.fn(),
  getFirebaseAuth: jest.fn(),
  getFirebaseDb: jest.fn(),
  signInWithGoogle: jest.fn().mockResolvedValue({ user: { uid: 'test-uid' } }),
  signOut: jest.fn().mockResolvedValue(undefined),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  getPasswords: jest.fn().mockResolvedValue([]),
  createPassword: jest.fn().mockResolvedValue(undefined),
  deletePassword: jest.fn().mockResolvedValue(undefined),
}))

// Mock Zustand stores
jest.mock('../stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    setUser: jest.fn(),
    setMasterKey: jest.fn(),
    logout: jest.fn(),
  })),
}))

jest.mock('../stores/vaultStore', () => ({
  useVaultStore: jest.fn(() => ({
    passwords: [],
    setPasswords: jest.fn(),
    addPassword: jest.fn(),
    deletePassword: jest.fn(),
    getFilteredPasswords: jest.fn(() => []),
  })),
}))
