# Prácticas de Desarrollo - CityVille 2025

> **Guía de Mejores Prácticas**: Testing, calidad de código, contribución y desarrollo colaborativo con IA.

---

## 🧪 Estrategia de Testing

### Pirámide de Testing

```mermaid
graph TD
    A[E2E Tests - 10%] --> B[Integration Tests - 20%]
    B --> C[Unit Tests - 70%]
    
    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#45b7d1
```

### Configuración de Testing

```typescript
// packages/config/src/testing/jest.config.base.ts
import type { Config } from 'jest';

const baseConfig: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000
};

export default baseConfig;
```

### Unit Testing Patterns

```typescript
// apps/api-gateway/src/services/__tests__/player.service.test.ts
import { PlayerService } from '../player.service';
import { MockPlayerRepository } from '../__mocks__/player.repository';
import { MockEconomyService } from '../__mocks__/economy.service';
import { MockEventBus } from '../__mocks__/event-bus';
import { PlayerLeveledUpEvent } from '@cityville/ecs-core';

describe('PlayerService', () => {
  let service: PlayerService;
  let mockRepository: MockPlayerRepository;
  let mockEconomyService: MockEconomyService;
  let mockEventBus: MockEventBus;
  
  beforeEach(() => {
    mockRepository = new MockPlayerRepository();
    mockEconomyService = new MockEconomyService();
    mockEventBus = new MockEventBus();
    
    service = new PlayerService(
      mockRepository,
      mockEconomyService,
      mockEventBus
    );
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('levelUp', () => {
    it('should level up player and grant rewards', async () => {
      // Arrange
      const userId = 'user123';
      const currentPlayer = {
        id: userId,
        level: 5,
        experience: 1000,
        coins: 500
      };
      
      mockRepository.findById.mockResolvedValue(currentPlayer);
      mockRepository.update.mockResolvedValue({
        ...currentPlayer,
        level: 6,
        coins: 600 // +100 coins reward
      });
      
      // Act
      const result = await service.levelUp(userId);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.newLevel).toBe(6);
      expect(result.rewards.coins).toBe(100);
      
      // Verificar que se publicó el evento
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.any(PlayerLeveledUpEvent)
      );
      
      // Verificar que se actualizó la economía
      expect(mockEconomyService.addCoins).toHaveBeenCalledWith(
        userId,
        100
      );
    });
    
    it('should fail when player has insufficient experience', async () => {
      // Arrange
      const userId = 'user123';
      const currentPlayer = {
        id: userId,
        level: 5,
        experience: 500, // Insuficiente para subir de nivel
        coins: 500
      };
      
      mockRepository.findById.mockResolvedValue(currentPlayer);
      
      // Act & Assert
      await expect(service.levelUp(userId))
        .rejects.toThrow('Insufficient experience to level up');
      
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
    
    it('should handle database errors gracefully', async () => {
      // Arrange
      const userId = 'user123';
      mockRepository.findById.mockRejectedValue(
        new Error('Database connection failed')
      );
      
      // Act & Assert
      await expect(service.levelUp(userId))
        .rejects.toThrow('Database connection failed');
    });
  });
  
  describe('updateEnergy', () => {
    it('should regenerate energy over time', async () => {
      // Arrange
      const userId = 'user123';
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      
      const player = {
        id: userId,
        energy: 25,
        maxEnergy: 30,
        lastEnergyUpdate: fiveMinutesAgo
      };
      
      mockRepository.findById.mockResolvedValue(player);
      
      // Mock Date.now para testing determinístico
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      // Act
      const result = await service.updateEnergy(userId, 0);
      
      // Assert
      expect(result.energy).toBe(30); // 25 + 5 (1 energy per minute)
      expect(result.lastUpdate).toBe(now);
      
      // Cleanup
      jest.restoreAllMocks();
    });
  });
});
```

### Integration Testing

```typescript
// apps/api-gateway/src/__tests__/integration/game-flow.integration.test.ts
import request from 'supertest';
import { app } from '../../app';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/database';
import { createTestUser, getAuthToken } from '../helpers/auth';
import { seedGameData } from '../helpers/seed';

describe('Game Flow Integration', () => {
  let authToken: string;
  let userId: string;
  
  beforeAll(async () => {
    await setupTestDatabase();
    await seedGameData();
    
    const user = await createTestUser({
      username: 'testplayer',
      email: 'test@example.com',
      coins: 1000,
      energy: 30
    });
    
    userId = user.id;
    authToken = await getAuthToken(user);
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  describe('Complete Building Flow', () => {
    it('should complete full building lifecycle', async () => {
      // 1. Build a house
      const buildResponse = await request(app)
        .post('/api/buildings/build')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          buildingType: 'house',
          position: { x: 5, y: 5 }
        })
        .expect(201);
      
      const buildingId = buildResponse.body.building.id;
      expect(buildResponse.body.building.isConstructed).toBe(false);
      
      // 2. Wait for construction (simulate time)
      await request(app)
        .post('/api/buildings/complete-construction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ buildingId })
        .expect(200);
      
      // 3. Verify building is constructed
      const statusResponse = await request(app)
        .get(`/api/buildings/${buildingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(statusResponse.body.building.isConstructed).toBe(true);
      
      // 4. Collect rent
      const collectResponse = await request(app)
        .post('/api/buildings/collect-rent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ buildingId })
        .expect(200);
      
      expect(collectResponse.body.rentCollected).toBeGreaterThan(0);
      expect(collectResponse.body.newBalance).toBeGreaterThan(1000);
      
      // 5. Upgrade building
      const upgradeResponse = await request(app)
        .post('/api/buildings/upgrade')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ buildingId })
        .expect(200);
      
      expect(upgradeResponse.body.building.level).toBe(2);
    });
    
    it('should handle quest progression during building', async () => {
      // 1. Get active quests
      const questsResponse = await request(app)
        .get('/api/quests/active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const buildQuest = questsResponse.body.quests.find(
        (q: any) => q.type === 'build_houses'
      );
      
      expect(buildQuest).toBeDefined();
      const initialProgress = buildQuest.progress.current;
      
      // 2. Build a house
      await request(app)
        .post('/api/buildings/build')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          buildingType: 'house',
          position: { x: 10, y: 10 }
        })
        .expect(201);
      
      // 3. Check quest progress updated
      const updatedQuestsResponse = await request(app)
        .get('/api/quests/active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const updatedQuest = updatedQuestsResponse.body.quests.find(
        (q: any) => q.id === buildQuest.id
      );
      
      expect(updatedQuest.progress.current).toBe(initialProgress + 1);
    });
  });
});
```

### E2E Testing con Playwright

```typescript
// apps/game-client/e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test';
import { GamePage } from './pages/game.page';
import { LoginPage } from './pages/login.page';

test.describe('Game Flow E2E', () => {
  let gamePage: GamePage;
  let loginPage: LoginPage;
  
  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    loginPage = new LoginPage(page);
    
    // Login with test user
    await loginPage.goto();
    await loginPage.login('testuser@example.com', 'password123');
    await gamePage.waitForGameToLoad();
  });
  
  test('should build and collect from a house', async ({ page }) => {
    // Verify initial state
    const initialCoins = await gamePage.getCoins();
    expect(initialCoins).toBeGreaterThan(0);
    
    // Open building menu
    await gamePage.openBuildingMenu();
    
    // Select house
    await gamePage.selectBuildingType('house');
    
    // Place building on grid
    await gamePage.placeBuildingAt(5, 5);
    
    // Verify building appears
    await expect(gamePage.getBuildingAt(5, 5)).toBeVisible();
    
    // Wait for construction to complete
    await gamePage.waitForConstruction(5, 5);
    
    // Collect rent
    await gamePage.collectRentAt(5, 5);
    
    // Verify coins increased
    const finalCoins = await gamePage.getCoins();
    expect(finalCoins).toBeGreaterThan(initialCoins);
    
    // Verify building shows collected state
    await expect(gamePage.getBuildingAt(5, 5)).toHaveClass(/collected/);
  });
  
  test('should complete tutorial quest', async ({ page }) => {
    // Open quest panel
    await gamePage.openQuestPanel();
    
    // Find tutorial quest
    const tutorialQuest = gamePage.getQuestByType('tutorial');
    await expect(tutorialQuest).toBeVisible();
    
    // Complete quest objectives
    await gamePage.buildHouse(3, 3);
    await gamePage.buildBakery(6, 6);
    await gamePage.collectRentAt(3, 3);
    
    // Verify quest completion
    await expect(tutorialQuest).toHaveClass(/completed/);
    
    // Claim reward
    await gamePage.claimQuestReward('tutorial');
    
    // Verify reward received
    const notification = gamePage.getNotification();
    await expect(notification).toContainText('Quest completed!');
  });
  
  test('should handle network disconnection gracefully', async ({ page, context }) => {
    // Simulate network offline
    await context.setOffline(true);
    
    // Try to build something
    await gamePage.openBuildingMenu();
    await gamePage.selectBuildingType('house');
    await gamePage.placeBuildingAt(8, 8);
    
    // Should show offline message
    const offlineMessage = gamePage.getOfflineMessage();
    await expect(offlineMessage).toBeVisible();
    
    // Restore network
    await context.setOffline(false);
    
    // Should reconnect and sync
    await expect(offlineMessage).not.toBeVisible();
    await expect(gamePage.getBuildingAt(8, 8)).toBeVisible();
  });
});
```

---

## 🔍 Calidad de Código

### ESLint Configuration

```json
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import',
    'jest',
    'security'
  ],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:security/recommended'
  ],
  rules: {
    // TypeScript específico
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    
    // Imports
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }
    ],
    'import/no-duplicates': 'error',
    'import/no-unused-modules': 'warn',
    
    // Seguridad
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    
    // Mejores prácticas
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'eqeqeq': 'error',
    'curly': 'error',
    
    // Testing
    'jest/expect-expect': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/prefer-to-have-length': 'warn'
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};
```

### SonarQube Configuration

```properties
# sonar-project.properties
sonar.projectKey=cityville-2025
sonar.projectName=CityVille 2025
sonar.projectVersion=1.0.0

# Source code
sonar.sources=apps,packages,services
sonar.exclusions=**/*.test.ts,**/*.spec.ts,**/node_modules/**,**/dist/**

# Test coverage
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=coverage/test-report.xml

# Quality gates
sonar.qualitygate.wait=true

# Rules
sonar.typescript.tsconfigPath=tsconfig.json
sonar.javascript.environments=node

# Security
sonar.security.hotspots.inheritFromParent=true
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: check-added-large-files
        args: ['--maxkb=1000']
  
  - repo: local
    hooks:
      - id: eslint
        name: ESLint
        entry: npm run lint
        language: system
        types: [typescript]
        pass_filenames: false
      
      - id: prettier
        name: Prettier
        entry: npm run format:check
        language: system
        types: [typescript, javascript, json, yaml]
        pass_filenames: false
      
      - id: type-check
        name: TypeScript Type Check
        entry: npm run type-check
        language: system
        types: [typescript]
        pass_filenames: false
      
      - id: test
        name: Unit Tests
        entry: npm run test:unit
        language: system
        types: [typescript]
        pass_filenames: false
      
      - id: security-audit
        name: Security Audit
        entry: npm audit --audit-level=moderate
        language: system
        pass_filenames: false
```

---

## 📝 Documentación de Código

### JSDoc Standards

```typescript
/**
 * Servicio para gestionar la economía del juego.
 * 
 * Maneja transacciones, balances y cálculos económicos.
 * Implementa el patrón Repository para acceso a datos.
 * 
 * @example
 * ```typescript
 * const economyService = new EconomyService(repository, eventBus);
 * const result = await economyService.processTransaction({
 *   userId: 'user123',
 *   amount: 100,
 *   type: 'building_purchase'
 * });
 * ```
 * 
 * @since 1.0.0
 * @author AI Development Team
 */
export class EconomyService {
  /**
   * Procesa una transacción económica.
   * 
   * @param transaction - Datos de la transacción
   * @param transaction.userId - ID del usuario
   * @param transaction.amount - Cantidad (positiva para ingresos, negativa para gastos)
   * @param transaction.type - Tipo de transacción
   * @param transaction.metadata - Metadatos adicionales
   * 
   * @returns Promise que resuelve con el resultado de la transacción
   * 
   * @throws {InsufficientFundsError} Cuando el usuario no tiene fondos suficientes
   * @throws {InvalidTransactionError} Cuando los datos de transacción son inválidos
   * 
   * @example
   * ```typescript
   * // Compra de edificio
   * const result = await economyService.processTransaction({
   *   userId: 'user123',
   *   amount: -500,
   *   type: 'building_purchase',
   *   metadata: { buildingId: 'building456', buildingType: 'house' }
   * });
   * 
   * if (result.success) {
   *   console.log(`New balance: ${result.newBalance}`);
   * }
   * ```
   * 
   * @since 1.0.0
   */
  async processTransaction(
    transaction: TransactionRequest
  ): Promise<TransactionResult> {
    // Implementation...
  }
  
  /**
   * Calcula la renta de un edificio basada en su tipo, nivel y tiempo.
   * 
   * @param buildingId - ID único del edificio
   * @param buildingType - Tipo de edificio ('house', 'apartment', etc.)
   * @param level - Nivel del edificio (1-10)
   * @param lastCollected - Timestamp de la última recolección
   * 
   * @returns Cálculo de renta con detalles
   * 
   * @internal
   * Fórmula: baseRent * levelMultiplier * timeMultiplier
   * - baseRent: Definido en BUILDING_CONFIG
   * - levelMultiplier: level * 1.2
   * - timeMultiplier: Math.min(hoursElapsed / 24, 1)
   * 
   * @since 1.0.0
   */
  private calculateRent(
    buildingId: string,
    buildingType: BuildingType,
    level: number,
    lastCollected: number
  ): RentCalculation {
    // Implementation...
  }
}

/**
 * Configuración de tipos de edificios y sus propiedades económicas.
 * 
 * @readonly
 * @since 1.0.0
 */
export const BUILDING_CONFIG = {
  house: {
    baseRent: 10,
    buildCost: 100,
    upgradeCostMultiplier: 1.5
  },
  apartment: {
    baseRent: 25,
    buildCost: 300,
    upgradeCostMultiplier: 1.8
  }
} as const;

/**
 * Tipos de transacciones económicas soportadas.
 * 
 * @since 1.0.0
 */
export type TransactionType = 
  | 'building_purchase'    // Compra de edificio
  | 'building_upgrade'     // Mejora de edificio
  | 'rent_collection'      // Recolección de renta
  | 'quest_reward'         // Recompensa de misión
  | 'iap_purchase'         // Compra in-app
  | 'gift_received';       // Regalo recibido
```

### README Templates

```markdown
<!-- apps/api-gateway/README.md -->
# API Gateway - CityVille 2025

## 📋 Descripción

API Gateway que actúa como Backend for Frontend (BFF), proporcionando una interfaz unificada para el cliente del juego. Implementa autenticación, autorización, rate limiting y orquestación de microservicios.

## 🏗️ Arquitectura

```mermaid
graph TD
    A[Game Client] --> B[API Gateway]
    B --> C[Economy Service]
    B --> D[Quest Service]
    B --> E[Social Service]
    B --> F[Game Server]
    B --> G[PostgreSQL]
    B --> H[Redis]
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- NATS 2.9+

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
npm run db:migrate

# Iniciar en modo desarrollo
npm run dev
```

## 📚 API Documentation

### Autenticación

Todos los endpoints (excepto `/auth/*`) requieren un token JWT válido:

```bash
Authorization: Bearer <jwt_token>
```

### Endpoints Principales

#### Player Management

- `GET /api/player/stats` - Obtener estadísticas del jugador
- `POST /api/player/level-up` - Subir de nivel
- `PUT /api/player/energy` - Actualizar energía

#### Building Management

- `GET /api/buildings` - Listar edificios del jugador
- `POST /api/buildings/build` - Construir edificio
- `POST /api/buildings/collect` - Recolectar renta
- `PUT /api/buildings/upgrade` - Mejorar edificio

### Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|----------|
| `/api/buildings/build` | 10 req | 1 min |
| `/api/buildings/collect` | 50 req | 10 seg |
| `/api/auth/login` | 5 req | 15 min |

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

## 📊 Monitoreo

### Health Checks

- `GET /health` - Estado general del servicio
- `GET /health/db` - Estado de la base de datos
- `GET /health/redis` - Estado de Redis

### Métricas

- Prometheus metrics en `/metrics`
- OpenTelemetry traces
- Structured logging con Winston

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | URL de PostgreSQL | - |
| `REDIS_URL` | URL de Redis | - |
| `JWT_SECRET` | Secreto para JWT | - |

### Configuración de Desarrollo

```typescript
// src/config/development.ts
export const developmentConfig = {
  database: {
    logging: true,
    synchronize: true
  },
  redis: {
    retryDelayOnFailover: 100
  },
  auth: {
    jwtExpiresIn: '24h'
  }
};
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t cityville/api-gateway .

# Run container
docker run -p 3000:3000 cityville/api-gateway
```

### Kubernetes

```bash
# Deploy with Helm
helm install api-gateway ./helm/api-gateway
```

## 🤝 Contribución

Ver [CONTRIBUTING.md](../../CONTRIBUTING.md) para guías de contribución.

## 📄 Licencia

MIT License - ver [LICENSE](../../LICENSE) para detalles.
```

---

## 🤝 Guías de Contribución

### Workflow de Contribución

```mermaid
graph LR
    A[Issue/Feature Request] --> B[Create Branch]
    B --> C[Develop]
    C --> D[Write Tests]
    D --> E[Update Docs]
    E --> F[Create PR]
    F --> G[Code Review]
    G --> H[CI/CD Checks]
    H --> I[Merge]
    I --> J[Deploy]
```

### Commit Message Convention

```bash
# Formato: <type>(<scope>): <description>

# Tipos válidos:
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Cambios de formato (no afectan lógica)
refactor: # Refactoring de código
test:     # Agregar o modificar tests
chore:    # Tareas de mantenimiento
perf:     # Mejoras de performance
ci:       # Cambios en CI/CD

# Ejemplos:
feat(buildings): add apartment building type
fix(economy): resolve transaction deadlock issue
docs(api): update authentication endpoints
test(player): add unit tests for level up logic
refactor(database): optimize query performance
```

### Pull Request Template

```markdown
<!-- .github/pull_request_template.md -->
## 📋 Descripción

Breve descripción de los cambios realizados.

## 🔗 Issue Relacionado

Fixes #(issue_number)

## 🧪 Tipo de Cambio

- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación (cambios solo en documentación)
- [ ] Refactoring (cambios que no agregan funcionalidad ni corrigen bugs)
- [ ] Performance (cambios que mejoran el rendimiento)
- [ ] Tests (agregar o modificar tests)

## ✅ Checklist

- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código, especialmente en áreas complejas
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban mi funcionalidad
- [ ] Los tests nuevos y existentes pasan localmente
- [ ] He verificado que no hay conflictos de merge

## 🧪 Testing

Describe las pruebas realizadas:

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

## 📸 Screenshots (si aplica)

<!-- Agregar screenshots de cambios UI -->

## 📝 Notas Adicionales

<!-- Cualquier información adicional relevante -->

## 🔍 Revisión de Código

### Para Revisores

- [ ] El código es legible y mantenible
- [ ] Los tests cubren los casos importantes
- [ ] La documentación está actualizada
- [ ] No hay vulnerabilidades de seguridad
- [ ] El rendimiento no se ve afectado negativamente
- [ ] Los cambios siguen los patrones arquitectónicos
```

### Code Review Guidelines

```markdown
# Guías de Code Review

## 🎯 Objetivos

1. **Calidad**: Mantener alta calidad de código
2. **Conocimiento**: Compartir conocimiento entre el equipo
3. **Consistencia**: Asegurar patrones consistentes
4. **Seguridad**: Identificar vulnerabilidades
5. **Performance**: Optimizar rendimiento

## ✅ Checklist del Revisor

### Funcionalidad
- [ ] El código hace lo que se supone que debe hacer
- [ ] Los edge cases están manejados
- [ ] Los errores se manejan apropiadamente
- [ ] La lógica de negocio es correcta

### Código
- [ ] El código es legible y bien estructurado
- [ ] Los nombres de variables/funciones son descriptivos
- [ ] No hay código duplicado
- [ ] Se siguen los principios SOLID
- [ ] El código está bien comentado

### Testing
- [ ] Hay tests para la nueva funcionalidad
- [ ] Los tests cubren casos edge
- [ ] Los tests son claros y mantenibles
- [ ] No hay tests flakey

### Seguridad
- [ ] No hay vulnerabilidades obvias
- [ ] Los inputs están validados
- [ ] No se exponen datos sensibles
- [ ] Se usan prácticas seguras de autenticación

### Performance
- [ ] No hay operaciones costosas innecesarias
- [ ] Las queries de DB están optimizadas
- [ ] Se usa caching apropiadamente
- [ ] No hay memory leaks

### Documentación
- [ ] La documentación está actualizada
- [ ] Los comentarios explican el "por qué", no el "qué"
- [ ] Los README están actualizados
- [ ] Los tipos están bien documentados

## 💬 Comunicación

### Tipos de Comentarios

- **🔴 Must Fix**: Problemas que deben corregirse
- **🟡 Suggestion**: Mejoras opcionales
- **💡 Idea**: Ideas para futuras mejoras
- **❓ Question**: Preguntas sobre el código
- **👍 Praise**: Reconocimiento de buen código

### Ejemplos de Comentarios Constructivos

```markdown
# ❌ Malo
"Este código está mal"

# ✅ Bueno
"🔴 Must Fix: Esta función podría causar un memory leak. 
Considerar usar un WeakMap en lugar de Map para evitar 
referencias circulares."

# ❌ Malo
"Cambiar esto"

# ✅ Bueno
"🟡 Suggestion: Podríamos extraer esta lógica a una función 
separada para mejorar la legibilidad y reutilización."
```

## ⏱️ Tiempos de Respuesta

- **Crítico**: 2 horas
- **Normal**: 24 horas
- **Documentación**: 48 horas

## 🔄 Proceso de Re-review

1. Autor implementa cambios
2. Autor responde a comentarios
3. Autor solicita re-review
4. Revisor verifica cambios
5. Aprobación o nuevos comentarios
```

---

## 🚀 Automatización y CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  GO_VERSION: '1.21'

jobs:
  # Análisis de código
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Format check
        run: npm run format:check
      
      - name: Security audit
        run: npm audit --audit-level=moderate
  
  # Tests unitarios
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
  
  # Tests de integración
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: cityville_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/cityville_test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/cityville_test
          REDIS_URL: redis://localhost:6379
  
  # Build y push de imágenes Docker
  build-images:
    runs-on: ubuntu-latest
    needs: [code-quality, unit-tests, integration-tests]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    strategy:
      matrix:
        service: [api-gateway, game-server, economy-service, quest-service, social-service]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ secrets.CONTAINER_REGISTRY }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.CONTAINER_REGISTRY }}/cityville/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./apps/${{ matrix.service }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
  
  # Deploy a staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build-images]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Helm
        uses: azure/setup-helm@v3
        with:
          version: '3.12.0'
      
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: '1.28.0'
      
      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
      
      - name: Deploy to staging
        run: |
          helm upgrade --install cityville-staging ./infra/helm/cityville \
            --namespace cityville-staging \
            --create-namespace \
            --values ./infra/helm/cityville/values-staging.yaml \
            --set global.imageTag=${{ github.sha }}
  
  # Deploy a producción
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build-images]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Helm
        uses: azure/setup-helm@v3
        with:
          version: '3.12.0'
      
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: '1.28.0'
      
      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG_PRODUCTION }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
      
      - name: Deploy to production
        run: |
          helm upgrade --install cityville-prod ./infra/helm/cityville \
            --namespace cityville-production \
            --create-namespace \
            --values ./infra/helm/cityville/values-production.yaml \
            --set global.imageTag=${{ github.sha }}
```

---

**Mantenimiento**: Revisar y actualizar prácticas trimestralmente  
**Evolución**: Adaptar herramientas según necesidades del equipo  
**Feedback**: Recopilar feedback del equipo para mejoras continuas