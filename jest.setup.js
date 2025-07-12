// Global Jest setup for all tests

// Extend Jest matchers
import 'jest-extended';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set up global test timeout
jest.setTimeout(10000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/cityville_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.NATS_URL = 'nats://localhost:4222';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long';

// Global test utilities
global.testUtils = {
  // Helper to create mock player data
  createMockPlayer: (overrides = {}) => ({
    id: 'test-player-id',
    username: 'testplayer',
    email: 'test@example.com',
    level: 1,
    experience: 0,
    coins: 1000,
    cityCash: 10,
    energy: 20,
    maxEnergy: 20,
    lastEnergyUpdate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // Helper to create mock building data
  createMockBuilding: (overrides = {}) => ({
    id: 'test-building-id',
    playerId: 'test-player-id',
    typeId: 'house',
    x: 5,
    y: 5,
    level: 1,
    state: 'idle',
    lastCollected: new Date(),
    constructedAt: new Date(),
    ...overrides,
  }),

  // Helper to create mock quest data
  createMockQuest: (overrides = {}) => ({
    id: 'test-quest-id',
    playerId: 'test-player-id',
    templateId: 'tutorial_build_house',
    status: 'active',
    progress: 0,
    maxProgress: 1,
    startedAt: new Date(),
    ...overrides,
  }),

  // Helper to wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate random test data
  randomString: (length = 10) => Math.random().toString(36).substring(2, length + 2),
  randomInt: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
};

// Global mocks for common modules
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    hdel: jest.fn(),
    hgetall: jest.fn(),
    zadd: jest.fn(),
    zrange: jest.fn(),
    zrem: jest.fn(),
    zscore: jest.fn(),
    pipeline: jest.fn(() => ({
      exec: jest.fn(),
    })),
    multi: jest.fn(() => ({
      exec: jest.fn(),
    })),
    disconnect: jest.fn(),
  };
  return jest.fn(() => mockRedis);
});

// Mock NATS for testing
jest.mock('nats', () => ({
  connect: jest.fn(() => Promise.resolve({
    publish: jest.fn(),
    subscribe: jest.fn(),
    drain: jest.fn(),
    close: jest.fn(),
    jetstream: jest.fn(() => ({
      publish: jest.fn(),
      subscribe: jest.fn(),
      pullSubscribe: jest.fn(),
    })),
  })),
  StringCodec: jest.fn(() => ({
    encode: jest.fn(str => Buffer.from(str)),
    decode: jest.fn(buf => buf.toString()),
  })),
  JSONCodec: jest.fn(() => ({
    encode: jest.fn(obj => Buffer.from(JSON.stringify(obj))),
    decode: jest.fn(buf => JSON.parse(buf.toString())),
  })),
}));

// Mock Colyseus for testing
jest.mock('colyseus', () => ({
  Room: class MockRoom {
    constructor() {
      this.clients = new Map();
      this.state = {};
      this.metadata = {};
    }
    onCreate() {}
    onJoin() {}
    onLeave() {}
    onMessage() {}
    onDispose() {}
    setState() {}
    setMetadata() {}
    broadcast() {}
    send() {}
  },
  Server: class MockServer {
    constructor() {
      this.rooms = new Map();
    }
    define() {}
    listen() {}
    gracefullyShutdown() {}
  },
}));

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});