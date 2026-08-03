module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
}
