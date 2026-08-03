// Jest setup file for Vaultly mobile tests
// This file is loaded before any test runs

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

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('act()'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
