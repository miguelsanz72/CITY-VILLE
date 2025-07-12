# Contexto Técnico - CityVille 2025

> **Referencia Técnica Completa**: APIs, esquemas, contratos y patrones de implementación para modelos de IA.

---

## 🗄️ Esquemas de Base de Datos

### PostgreSQL Schema

#### Tabla: players
```sql
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    coins BIGINT DEFAULT 1000,
    city_cash INTEGER DEFAULT 50,
    energy INTEGER DEFAULT 30,
    max_energy INTEGER DEFAULT 30,
    last_energy_update TIMESTAMP DEFAULT NOW(),
    city_name VARCHAR(100) DEFAULT 'Mi Ciudad',
    tutorial_completed BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sharding por user_id para Citus
SELECT create_distributed_table('players', 'user_id');

-- Índices
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_level ON players(level);
CREATE INDEX idx_players_last_login ON players(last_login);
```

#### Tabla: buildings
```sql
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    building_type VARCHAR(50) NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    level INTEGER DEFAULT 1,
    last_collected TIMESTAMP,
    construction_started TIMESTAMP DEFAULT NOW(),
    construction_completed TIMESTAMP,
    is_constructed BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_position_per_user UNIQUE(user_id, position_x, position_y),
    CONSTRAINT valid_position CHECK (position_x >= 0 AND position_y >= 0),
    CONSTRAINT valid_level CHECK (level >= 1 AND level <= 10)
);

-- Sharding por user_id
SELECT create_distributed_table('buildings', 'user_id');

-- Índices
CREATE INDEX idx_buildings_user_id ON buildings(user_id);
CREATE INDEX idx_buildings_type ON buildings(building_type);
CREATE INDEX idx_buildings_position ON buildings(user_id, position_x, position_y);
CREATE INDEX idx_buildings_collection ON buildings(user_id, last_collected) WHERE is_constructed = TRUE;
```

#### Tabla: transactions
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'building_purchase', 'rent_collection', 'iap', etc.
    amount BIGINT NOT NULL,
    currency VARCHAR(20) NOT NULL, -- 'coins', 'city_cash', 'usd'
    reference_id UUID, -- ID del edificio, quest, etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sharding por user_id
SELECT create_distributed_table('transactions', 'user_id');

-- Índices
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

#### Tabla: quests
```sql
CREATE TABLE quest_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    quest_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'claimed'
    progress JSONB DEFAULT '{}', -- { "objectives": [{ "type": "build", "current": 2, "required": 5 }] }
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    claimed_at TIMESTAMP,
    
    CONSTRAINT unique_user_quest UNIQUE(user_id, quest_id)
);

-- Sharding por user_id
SELECT create_distributed_table('quest_progress', 'user_id');

-- Índices
CREATE INDEX idx_quest_progress_user_id ON quest_progress(user_id);
CREATE INDEX idx_quest_progress_status ON quest_progress(user_id, status);
```

#### Tabla: friendships
```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    friend_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    friendship_level INTEGER DEFAULT 1,
    last_interaction TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
    CONSTRAINT unique_friendship UNIQUE(user_id, friend_id)
);

-- Sharding por user_id
SELECT create_distributed_table('friendships', 'user_id');

-- Índices
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(user_id, status);
```

### Redis Schema

#### Game State Cache
```typescript
// Estructura de caché de estado del juego
interface GameStateCache {
  [`game:${userId}`]: {
    energy: {
      current: number;
      max: number;
      lastUpdate: number;
    };
    buildings: {
      [buildingId: string]: {
        lastCollected: number;
        isReady: boolean;
        rentAmount: number;
      };
    };
    activeQuests: string[];
    lastActivity: number;
    ttl: number; // 1 hora
  };
}

// Ejemplo de keys Redis
// game:user123 -> JSON del estado del juego
// session:sessionABC -> ID del usuario
// leaderboard:coins -> Sorted set con top jugadores
// daily_quests:2025-01-15 -> Set con IDs de quests diarias
```

#### Session Management
```typescript
// Sesiones de Colyseus
interface SessionCache {
  [`session:${sessionId}`]: {
    userId: string;
    roomId: string;
    connectedAt: number;
    lastPing: number;
    ttl: number; // 24 horas
  };
}

// Rate limiting
interface RateLimitCache {
  [`ratelimit:${userId}:${action}`]: {
    count: number;
    resetAt: number;
    ttl: number; // Según la acción
  };
}
```

---

## 🔌 APIs y Contratos

### tRPC API (api-gateway)

#### Player Routes
```typescript
// apps/api-gateway/src/routers/player.router.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const playerRouter = router({
  // Obtener estadísticas del jugador
  getStats: protectedProcedure
    .input(z.object({
      userId: z.string().optional() // Si no se proporciona, usa el usuario autenticado
    }))
    .query(async ({ input, ctx }) => {
      const userId = input.userId || ctx.user.id;
      return await ctx.playerService.getPlayerStats(userId);
    }),

  // Actualizar energía
  updateEnergy: protectedProcedure
    .input(z.object({
      amount: z.number().int().min(-100).max(100)
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.playerService.updateEnergy(ctx.user.id, input.amount);
    }),

  // Subir de nivel
  levelUp: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await ctx.playerService.levelUp(ctx.user.id);
    }),

  // Obtener leaderboard
  getLeaderboard: publicProcedure
    .input(z.object({
      type: z.enum(['coins', 'level', 'buildings']),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0)
    }))
    .query(async ({ input, ctx }) => {
      return await ctx.playerService.getLeaderboard(input.type, input.limit, input.offset);
    })
});

// Tipos generados automáticamente
export type PlayerRouter = typeof playerRouter;
```

#### Building Routes
```typescript
// apps/api-gateway/src/routers/building.router.ts
export const buildingRouter = router({
  // Listar edificios del jugador
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.buildingService.getUserBuildings(ctx.user.id);
    }),

  // Construir edificio
  build: protectedProcedure
    .input(z.object({
      buildingType: z.enum(['house', 'apartment', 'mansion', 'bakery', 'restaurant', 'mall']),
      position: z.object({
        x: z.number().int().min(0).max(23),
        y: z.number().int().min(0).max(23)
      })
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.buildingService.buildBuilding(
        ctx.user.id,
        input.buildingType,
        input.position
      );
    }),

  // Recolectar renta
  collectRent: protectedProcedure
    .input(z.object({
      buildingId: z.string().uuid()
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.buildingService.collectRent(ctx.user.id, input.buildingId);
    }),

  // Mejorar edificio
  upgrade: protectedProcedure
    .input(z.object({
      buildingId: z.string().uuid()
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.buildingService.upgradeBuilding(ctx.user.id, input.buildingId);
    }),

  // Obtener información de tipo de edificio
  getBuildingInfo: publicProcedure
    .input(z.object({
      buildingType: z.string()
    }))
    .query(async ({ input, ctx }) => {
      return await ctx.buildingService.getBuildingTypeInfo(input.buildingType);
    })
});
```

### gRPC Services (Microservicios Go)

#### Economy Service
```protobuf
// packages/proto/economy.proto
syntax = "proto3";

package economy;

option go_package = "github.com/divisi/cityville/services/economy/pb";

service EconomyService {
  rpc ProcessTransaction(TransactionRequest) returns (TransactionResponse);
  rpc GetPlayerBalance(BalanceRequest) returns (BalanceResponse);
  rpc CalculateRent(RentCalculationRequest) returns (RentCalculationResponse);
  rpc ProcessPurchase(PurchaseRequest) returns (PurchaseResponse);
}

message TransactionRequest {
  string user_id = 1;
  string transaction_type = 2;
  int64 amount = 3;
  string currency = 4;
  string reference_id = 5;
  map<string, string> metadata = 6;
}

message TransactionResponse {
  bool success = 1;
  string transaction_id = 2;
  int64 new_balance = 3;
  string error_message = 4;
}

message BalanceRequest {
  string user_id = 1;
  repeated string currencies = 2; // ["coins", "city_cash"]
}

message BalanceResponse {
  map<string, int64> balances = 1; // {"coins": 1500, "city_cash": 25}
}

message RentCalculationRequest {
  string building_id = 1;
  string building_type = 2;
  int32 level = 3;
  int64 last_collected = 4;
}

message RentCalculationResponse {
  int64 rent_amount = 1;
  int64 time_since_last_collection = 2;
  int32 multiplier = 3;
}

message PurchaseRequest {
  string user_id = 1;
  string item_type = 2;
  string item_id = 3;
  int64 cost = 4;
  string currency = 5;
}

message PurchaseResponse {
  bool success = 1;
  string transaction_id = 2;
  int64 remaining_balance = 3;
  string error_message = 4;
}
```

#### Quest Service
```protobuf
// packages/proto/quests.proto
syntax = "proto3";

package quests;

option go_package = "github.com/divisi/cityville/services/quests/pb";

service QuestService {
  rpc GetActiveQuests(ActiveQuestsRequest) returns (ActiveQuestsResponse);
  rpc UpdateProgress(ProgressUpdateRequest) returns (ProgressUpdateResponse);
  rpc CompleteQuest(CompleteQuestRequest) returns (CompleteQuestResponse);
  rpc ClaimReward(ClaimRewardRequest) returns (ClaimRewardResponse);
}

message ActiveQuestsRequest {
  string user_id = 1;
  repeated string quest_types = 2; // ["daily", "weekly", "tutorial"]
}

message ActiveQuestsResponse {
  repeated Quest quests = 1;
}

message Quest {
  string id = 1;
  string type = 2;
  string title = 3;
  string description = 4;
  repeated Objective objectives = 5;
  Reward reward = 6;
  string status = 7;
  int64 started_at = 8;
  int64 expires_at = 9;
}

message Objective {
  string type = 1; // "build", "collect_rent", "visit_friends"
  string target = 2; // "house", "bakery", etc.
  int32 current = 3;
  int32 required = 4;
  bool completed = 5;
}

message Reward {
  int64 coins = 1;
  int32 city_cash = 2;
  int32 experience = 3;
  int32 energy = 4;
  repeated string items = 5;
}

message ProgressUpdateRequest {
  string user_id = 1;
  string action_type = 2;
  string target = 3;
  int32 count = 4;
  map<string, string> metadata = 5;
}

message ProgressUpdateResponse {
  repeated string updated_quests = 1;
  repeated string completed_quests = 2;
}
```

### WebSocket Events (Colyseus)

#### Game Room State
```typescript
// apps/game-server/src/rooms/CityRoom.ts
import { Schema, type, MapSchema } from '@colyseus/schema';

export class Player extends Schema {
  @type('string') id: string;
  @type('string') username: string;
  @type('number') level: number;
  @type('number') coins: number;
  @type('number') cityCash: number;
  @type('number') energy: number;
  @type('number') maxEnergy: number;
  @type('number') lastEnergyUpdate: number;
  @type('boolean') online: boolean;
}

export class Building extends Schema {
  @type('string') id: string;
  @type('string') type: string;
  @type('number') x: number;
  @type('number') y: number;
  @type('number') level: number;
  @type('number') lastCollected: number;
  @type('boolean') isConstructed: boolean;
  @type('boolean') canCollect: boolean;
}

export class CityState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Building }) buildings = new MapSchema<Building>();
  @type('number') lastUpdate: number;
}

// Mensajes del cliente
interface ClientMessages {
  'build_building': {
    buildingType: string;
    x: number;
    y: number;
  };
  
  'collect_rent': {
    buildingId: string;
  };
  
  'upgrade_building': {
    buildingId: string;
  };
  
  'chat_message': {
    message: string;
  };
}

// Mensajes del servidor
interface ServerMessages {
  'building_built': {
    buildingId: string;
    success: boolean;
    error?: string;
  };
  
  'rent_collected': {
    buildingId: string;
    amount: number;
    newBalance: number;
  };
  
  'energy_updated': {
    newEnergy: number;
    maxEnergy: number;
  };
  
  'player_leveled_up': {
    newLevel: number;
    rewards: any;
  };
}
```

---

## 🔄 Event Sourcing con NATS

### Event Schemas

```typescript
// packages/ecs-core/src/events/base.ts
export abstract class DomainEvent {
  abstract readonly type: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
  readonly timestamp: number;
  readonly userId: string;
  
  constructor(
    aggregateId: string,
    aggregateType: string,
    version: number,
    userId: string
  ) {
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.version = version;
    this.userId = userId;
    this.timestamp = Date.now();
  }
}

// Eventos específicos
export class BuildingConstructedEvent extends DomainEvent {
  readonly type = 'BuildingConstructed';
  
  constructor(
    aggregateId: string,
    version: number,
    public readonly userId: string,
    public readonly buildingType: string,
    public readonly position: { x: number; y: number },
    public readonly cost: number
  ) {
    super(aggregateId, 'Building', version, userId);
  }
}

export class RentCollectedEvent extends DomainEvent {
  readonly type = 'RentCollected';
  
  constructor(
    aggregateId: string,
    version: number,
    public readonly userId: string,
    public readonly buildingId: string,
    public readonly amount: number,
    public readonly collectedAt: number
  ) {
    super(aggregateId, 'Building', version, userId);
  }
}

export class PlayerLeveledUpEvent extends DomainEvent {
  readonly type = 'PlayerLeveledUp';
  
  constructor(
    aggregateId: string,
    version: number,
    public readonly userId: string,
    public readonly oldLevel: number,
    public readonly newLevel: number,
    public readonly rewards: any
  ) {
    super(aggregateId, 'Player', version, userId);
  }
}
```

### NATS Subjects

```typescript
// Estructura de subjects NATS
const NATS_SUBJECTS = {
  // Eventos de dominio
  BUILDING: {
    CONSTRUCTED: 'building.constructed',
    UPGRADED: 'building.upgraded',
    RENT_COLLECTED: 'building.rent_collected'
  },
  
  PLAYER: {
    REGISTERED: 'player.registered',
    LEVELED_UP: 'player.leveled_up',
    ENERGY_UPDATED: 'player.energy_updated'
  },
  
  ECONOMY: {
    TRANSACTION_PROCESSED: 'economy.transaction_processed',
    BALANCE_UPDATED: 'economy.balance_updated'
  },
  
  QUEST: {
    PROGRESS_UPDATED: 'quest.progress_updated',
    COMPLETED: 'quest.completed',
    REWARD_CLAIMED: 'quest.reward_claimed'
  },
  
  SOCIAL: {
    FRIEND_ADDED: 'social.friend_added',
    CITY_VISITED: 'social.city_visited',
    GIFT_SENT: 'social.gift_sent'
  }
};

// Configuración de streams
const STREAM_CONFIG = {
  GAME_EVENTS: {
    name: 'GAME_EVENTS',
    subjects: ['building.*', 'player.*', 'economy.*'],
    retention: 'interest',
    storage: 'file',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
  },
  
  ANALYTICS: {
    name: 'ANALYTICS',
    subjects: ['*.analytics'],
    retention: 'limits',
    storage: 'file',
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 días
  }
};
```

---

## 🔐 Autenticación y Autorización

### JWT Token Structure

```typescript
interface JWTPayload {
  sub: string;          // User ID
  username: string;
  email: string;
  level: number;
  roles: string[];      // ['player', 'admin', 'moderator']
  permissions: string[]; // ['read:own_data', 'write:own_data']
  iat: number;          // Issued at
  exp: number;          // Expires at
  iss: string;          // Issuer (cityville-auth)
  aud: string;          // Audience (cityville-api)
}

// Middleware de autenticación
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Verificar que el token no esté en blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token revoked' });
    }
    
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Rate Limiting

```typescript
// Rate limiting por endpoint
const RATE_LIMITS = {
  'POST /api/buildings/build': {
    windowMs: 60 * 1000,    // 1 minuto
    max: 10,                // 10 construcciones por minuto
    message: 'Too many buildings built'
  },
  
  'POST /api/buildings/collect': {
    windowMs: 10 * 1000,    // 10 segundos
    max: 50,                // 50 recolecciones por 10 segundos
    message: 'Too many collections'
  },
  
  'POST /api/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,                   // 5 intentos por 15 minutos
    message: 'Too many login attempts'
  }
};

// Implementación con Redis
export const createRateLimit = (config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `ratelimit:${req.ip}:${req.route.path}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, Math.ceil(config.windowMs / 1000));
    }
    
    if (current > config.max) {
      return res.status(429).json({
        error: config.message,
        retryAfter: await redis.ttl(key)
      });
    }
    
    res.setHeader('X-RateLimit-Limit', config.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - current));
    
    next();
  };
};
```

---

## 📊 Observabilidad

### OpenTelemetry Configuration

```typescript
// packages/config/src/telemetry.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || 'cityville-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
  }),
  instrumentations: [getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': {
      enabled: false // Demasiado verbose
    }
  })]
});

sdk.start();

// Custom metrics
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('cityville-metrics');

export const gameMetrics = {
  buildingsBuilt: meter.createCounter('buildings_built_total', {
    description: 'Total number of buildings built'
  }),
  
  rentCollected: meter.createCounter('rent_collected_total', {
    description: 'Total rent collected'
  }),
  
  activeUsers: meter.createUpDownCounter('active_users', {
    description: 'Number of currently active users'
  }),
  
  apiLatency: meter.createHistogram('api_request_duration_ms', {
    description: 'API request duration in milliseconds'
  })
};
```

### Structured Logging

```typescript
// packages/config/src/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'cityville-service',
    version: process.env.SERVICE_VERSION || '1.0.0'
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Helper para logging estructurado
export const logGameAction = (action: string, userId: string, metadata: any = {}) => {
  logger.info('Game action performed', {
    action,
    userId,
    ...metadata,
    timestamp: Date.now()
  });
};

export const logError = (error: Error, context: any = {}) => {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    ...context
  });
};
```

---

## 🧪 Testing Patterns

### Unit Testing

```typescript
// apps/api-gateway/src/services/__tests__/building.service.test.ts
import { BuildingService } from '../building.service';
import { MockBuildingRepository } from '../__mocks__/building.repository';
import { MockEconomyService } from '../__mocks__/economy.service';

describe('BuildingService', () => {
  let service: BuildingService;
  let mockRepository: MockBuildingRepository;
  let mockEconomyService: MockEconomyService;
  
  beforeEach(() => {
    mockRepository = new MockBuildingRepository();
    mockEconomyService = new MockEconomyService();
    service = new BuildingService(mockRepository, mockEconomyService);
  });
  
  describe('buildBuilding', () => {
    it('should build a building successfully', async () => {
      // Arrange
      const userId = 'user123';
      const buildingType = 'house';
      const position = { x: 5, y: 5 };
      
      mockEconomyService.mockGetBalance.mockResolvedValue({ coins: 1000 });
      mockEconomyService.mockProcessPurchase.mockResolvedValue({ success: true });
      mockRepository.mockCreate.mockResolvedValue({
        id: 'building123',
        userId,
        buildingType,
        ...position
      });
      
      // Act
      const result = await service.buildBuilding(userId, buildingType, position);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.building.buildingType).toBe(buildingType);
      expect(mockEconomyService.mockProcessPurchase).toHaveBeenCalledWith({
        userId,
        itemType: 'building',
        itemId: buildingType,
        cost: 100, // Costo de una casa
        currency: 'coins'
      });
    });
    
    it('should fail when user has insufficient funds', async () => {
      // Arrange
      const userId = 'user123';
      const buildingType = 'house';
      const position = { x: 5, y: 5 };
      
      mockEconomyService.mockGetBalance.mockResolvedValue({ coins: 50 });
      
      // Act & Assert
      await expect(service.buildBuilding(userId, buildingType, position))
        .rejects.toThrow('Insufficient funds');
    });
  });
});
```

### Integration Testing

```typescript
// apps/api-gateway/src/__tests__/integration/building.integration.test.ts
import request from 'supertest';
import { app } from '../../app';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/database';
import { createTestUser, getAuthToken } from '../helpers/auth';

describe('Building API Integration', () => {
  let authToken: string;
  let userId: string;
  
  beforeAll(async () => {
    await setupTestDatabase();
    const user = await createTestUser();
    userId = user.id;
    authToken = await getAuthToken(user);
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  describe('POST /api/buildings/build', () => {
    it('should build a building successfully', async () => {
      const response = await request(app)
        .post('/api/buildings/build')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          buildingType: 'house',
          position: { x: 5, y: 5 }
        })
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.building.buildingType).toBe('house');
      expect(response.body.building.position).toEqual({ x: 5, y: 5 });
    });
    
    it('should return 400 for invalid position', async () => {
      const response = await request(app)
        .post('/api/buildings/build')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          buildingType: 'house',
          position: { x: -1, y: 5 } // Posición inválida
        })
        .expect(400);
      
      expect(response.body.error).toContain('Invalid position');
    });
  });
});
```

---

**Mantenimiento**: Actualizar esquemas cuando cambien las APIs  
**Versionado**: Usar semantic versioning para cambios de contrato  
**Documentación**: Generar docs automáticamente desde código