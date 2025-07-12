module.exports = {
  // Use TypeScript preset
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Root directory
  rootDir: '.',
  
  // Test match patterns
  testMatch: [
    '<rootDir>/apps/**/__tests__/**/*.(test|spec).ts',
    '<rootDir>/packages/**/__tests__/**/*.(test|spec).ts',
    '<rootDir>/apps/**/*.(test|spec).ts',
    '<rootDir>/packages/**/*.(test|spec).ts',
  ],
  
  // Module paths
  moduleNameMapping: {
    '^@cityville/ecs-core$': '<rootDir>/packages/ecs-core/src',
    '^@cityville/ecs-core/(.*)$': '<rootDir>/packages/ecs-core/src/$1',
    '^@cityville/proto$': '<rootDir>/packages/proto/src',
    '^@cityville/proto/(.*)$': '<rootDir>/packages/proto/src/$1',
    '^@cityville/config$': '<rootDir>/packages/config/src',
    '^@cityville/config/(.*)$': '<rootDir>/packages/config/src/$1',
    '^@cityville/ui-react$': '<rootDir>/packages/ui-react/src',
    '^@cityville/ui-react/(.*)$': '<rootDir>/packages/ui-react/src/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Coverage configuration
  collectCoverage: false,
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx}',
    'packages/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.config.{js,ts}',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
  
  // Global setup and teardown
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Error on deprecated features
  errorOnDeprecated: true,
  
  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/apps/**/*.test.ts', '<rootDir>/packages/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/apps/**/*.integration.test.ts', '<rootDir>/packages/**/*.integration.test.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.integration-setup.js'],
    },
    {
      displayName: 'client',
      testMatch: ['<rootDir>/apps/game-client/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.client-setup.js'],
      moduleNameMapping: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
      },
    },
  ],
};