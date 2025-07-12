# Estándares de Código - CityVille 2025

> **Guía de Consistencia**: Convenciones obligatorias para todos los modelos de IA que contribuyan al proyecto.

---

## 🎯 Principios Fundamentales

### 1. Legibilidad sobre Brevedad
```typescript
// ❌ Malo
const u = users.filter(u => u.a && u.s === 'active').map(u => ({...u, n: u.name.toUpperCase()}));

// ✅ Bueno
const activeUsers = users
  .filter(user => user.isActive && user.status === 'active')
  .map(user => ({
    ...user,
    displayName: user.name.toUpperCase()
  }));
```

### 2. Tipado Estricto
```typescript
// ❌ Malo
function processBuilding(building: any): any {
  return building.type === 'house' ? building.rent * 2 : building.rent;
}

// ✅ Bueno
interface Building {
  id: string;
  type: BuildingType;
  rent: number;
  level: number;
}

function processBuilding(building: Building): number {
  return building.type === BuildingType.HOUSE 
    ? building.rent * HOUSE_MULTIPLIER 
    : building.rent;
}
```

### 3. Inmutabilidad por Defecto
```typescript
// ❌ Malo
function updatePlayerCoins(player: Player, amount: number): void {
  player.coins += amount;
  player.lastUpdated = Date.now();
}

// ✅ Bueno
function updatePlayerCoins(player: Player, amount: number): Player {
  return {
    ...player,
    coins: player.coins + amount,
    lastUpdated: Date.now()
  };
}
```

---

## 📝 Convenciones de Naming

### TypeScript/JavaScript

```typescript
// Variables y funciones: camelCase
const playerEnergy = 30;
const maxBuildingLevel = 10;
function calculateRent(building: Building): number {}

// Clases: PascalCase
class BuildingManager {}
class EnergySystem {}
class PlayerRepository {}

// Interfaces: PascalCase con prefijo 'I' opcional
interface Player {} // Preferido
interface IPlayer {} // Aceptable

// Types: PascalCase
type BuildingType = 'house' | 'shop' | 'factory';
type GameState = 'loading' | 'playing' | 'paused';

// Enums: PascalCase con valores SCREAMING_SNAKE_CASE
enum BuildingType {
  HOUSE = 'HOUSE',
  SHOP = 'SHOP',
  FACTORY = 'FACTORY'
}

// Constantes: SCREAMING_SNAKE_CASE
const MAX_ENERGY = 30;
const ENERGY_RECHARGE_TIME = 300; // 5 minutos en segundos
const DEFAULT_BUILDING_COST = 100;

// Archivos: kebab-case
// building-manager.ts
// energy-system.ts
// player-repository.ts

// Componentes React: PascalCase
// BuildingCard.tsx
// EnergyBar.tsx
// PlayerStats.tsx
```

### Go

```go
// Packages: lowercase, single word
package economy
package quests
package social

// Variables y funciones públicas: PascalCase
func CalculateRent(building Building) int {}
var MaxEnergyLevel = 30

// Variables y funciones privadas: camelCase
func calculateBonus(level int) int {}
var defaultMultiplier = 1.5

// Structs: PascalCase
type Player struct {
    ID     string `json:"id"`
    Coins  int    `json:"coins"`
    Energy int    `json:"energy"`
}

// Interfaces: PascalCase con sufijo 'er'
type PlayerRepository interface {
    GetPlayer(id string) (*Player, error)
    UpdatePlayer(player *Player) error
}

// Constantes: PascalCase o camelCase según visibilidad
const (
    MaxEnergyLevel = 30        // Público
    energyRechargeTime = 300   // Privado
)

// Archivos: snake_case
// player_repository.go
// energy_system.go
// building_manager.go
```

---

## 🏗️ Estructura de Archivos

### Frontend (TypeScript/React)

```
src/
├── components/           # Componentes React reutilizables
│   ├── ui/              # Componentes básicos (Button, Input, etc.)
│   ├── game/            # Componentes específicos del juego
│   └── layout/          # Componentes de layout
├── pages/               # Páginas/rutas principales
├── hooks/               # Custom React hooks
├── services/            # Servicios de API y lógica de negocio
├── stores/              # Estado global (Zustand/Redux)
├── types/               # Definiciones de tipos TypeScript
├── utils/               # Funciones utilitarias
├── constants/           # Constantes de la aplicación
└── assets/              # Recursos estáticos
    ├── images/
    ├── sounds/
    └── fonts/
```

### Backend (Go)

```
cmd/
└── server/              # Punto de entrada de la aplicación
    └── main.go
internal/
├── domain/              # Entidades de dominio
│   ├── player/
│   ├── building/
│   └── economy/
├── repository/          # Acceso a datos
├── service/             # Lógica de negocio
├── handler/             # Handlers HTTP/gRPC
├── middleware/          # Middleware personalizado
└── config/              # Configuración
pkg/                     # Código reutilizable público
api/                     # Definiciones de API (proto, OpenAPI)
scripts/                 # Scripts de desarrollo
```

---

## 🔧 Configuración de Herramientas

### ESLint (.eslintrc.js)

```javascript
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    // Naming conventions
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variableLike',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE']
      },
      {
        selector: 'typeLike',
        format: ['PascalCase']
      }
    ],
    
    // Code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    
    // TypeScript specific
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    
    // React specific
    'react/prop-types': 'off', // Using TypeScript
    'react/react-in-jsx-scope': 'off', // React 17+
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### Prettier (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Go Linting (golangci-lint)

```yaml
# .golangci.yml
linters:
  enable:
    - gofmt
    - goimports
    - govet
    - errcheck
    - staticcheck
    - unused
    - gosimple
    - structcheck
    - varcheck
    - ineffassign
    - deadcode
    - typecheck
    - gosec
    - gocyclo
    - dupl
    - goconst
    - gocognit
    - godox
    - misspell

linters-settings:
  gocyclo:
    min-complexity: 10
  gocognit:
    min-complexity: 20
  dupl:
    threshold: 100
```

---

## 📚 Patrones de Código

### 1. Error Handling

```typescript
// TypeScript - Result Pattern
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function parsePlayerData(raw: string): Result<Player> {
  try {
    const data = JSON.parse(raw);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Uso
const result = parsePlayerData(rawData);
if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error.message);
}
```

```go
// Go - Error handling estándar
func GetPlayer(id string) (*Player, error) {
    if id == "" {
        return nil, errors.New("player ID cannot be empty")
    }
    
    player, err := repository.FindByID(id)
    if err != nil {
        return nil, fmt.Errorf("failed to get player %s: %w", id, err)
    }
    
    return player, nil
}

// Uso
player, err := GetPlayer("123")
if err != nil {
    log.Printf("Error: %v", err)
    return
}
fmt.Printf("Player: %s", player.Name)
```

### 2. Logging

```typescript
// TypeScript - Structured logging
import { logger } from './logger';

class BuildingService {
  async collectRent(buildingId: string, playerId: string): Promise<number> {
    logger.info('Collecting rent', {
      buildingId,
      playerId,
      timestamp: Date.now()
    });
    
    try {
      const rent = await this.calculateRent(buildingId);
      
      logger.info('Rent collected successfully', {
        buildingId,
        playerId,
        amount: rent
      });
      
      return rent;
    } catch (error) {
      logger.error('Failed to collect rent', {
        buildingId,
        playerId,
        error: error.message
      });
      throw error;
    }
  }
}
```

```go
// Go - Structured logging con slog
import "log/slog"

func (s *BuildingService) CollectRent(buildingID, playerID string) (int, error) {
    slog.Info("Collecting rent",
        "buildingId", buildingID,
        "playerId", playerID,
    )
    
    rent, err := s.calculateRent(buildingID)
    if err != nil {
        slog.Error("Failed to collect rent",
            "buildingId", buildingID,
            "playerId", playerID,
            "error", err,
        )
        return 0, err
    }
    
    slog.Info("Rent collected successfully",
        "buildingId", buildingID,
        "playerId", playerID,
        "amount", rent,
    )
    
    return rent, nil
}
```

### 3. Testing

```typescript
// TypeScript - Jest testing
describe('BuildingService', () => {
  let service: BuildingService;
  let mockRepository: jest.Mocked<BuildingRepository>;
  
  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn()
    } as jest.Mocked<BuildingRepository>;
    
    service = new BuildingService(mockRepository);
  });
  
  describe('collectRent', () => {
    it('should collect rent successfully', async () => {
      // Arrange
      const building = createMockBuilding({ rent: 100 });
      mockRepository.findById.mockResolvedValue(building);
      
      // Act
      const result = await service.collectRent('building-1', 'player-1');
      
      // Assert
      expect(result).toBe(100);
      expect(mockRepository.findById).toHaveBeenCalledWith('building-1');
    });
    
    it('should throw error when building not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.collectRent('invalid', 'player-1'))
        .rejects.toThrow('Building not found');
    });
  });
});
```

```go
// Go - Table-driven tests
func TestBuildingService_CollectRent(t *testing.T) {
    tests := []struct {
        name        string
        buildingID  string
        playerID    string
        mockBuilding *Building
        mockError   error
        wantRent    int
        wantError   bool
    }{
        {
            name:       "successful rent collection",
            buildingID: "building-1",
            playerID:   "player-1",
            mockBuilding: &Building{ID: "building-1", Rent: 100},
            wantRent:   100,
            wantError:  false,
        },
        {
            name:       "building not found",
            buildingID: "invalid",
            playerID:   "player-1",
            mockError:  errors.New("not found"),
            wantError:  true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Arrange
            mockRepo := &MockBuildingRepository{}
            if tt.mockError != nil {
                mockRepo.On("FindByID", tt.buildingID).Return(nil, tt.mockError)
            } else {
                mockRepo.On("FindByID", tt.buildingID).Return(tt.mockBuilding, nil)
            }
            
            service := NewBuildingService(mockRepo)
            
            // Act
            rent, err := service.CollectRent(tt.buildingID, tt.playerID)
            
            // Assert
            if tt.wantError {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
                assert.Equal(t, tt.wantRent, rent)
            }
        })
    }
}
```

---

## 🎮 Patrones Específicos del Juego

### 1. ECS Components

```typescript
// Base component interface
interface Component {
  readonly type: string;
}

// Specific components
class PositionComponent implements Component {
  readonly type = 'position';
  
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0
  ) {}
}

class SpriteComponent implements Component {
  readonly type = 'sprite';
  
  constructor(
    public texture: string,
    public visible: boolean = true,
    public alpha: number = 1
  ) {}
}

class BuildingComponent implements Component {
  readonly type = 'building';
  
  constructor(
    public buildingType: BuildingType,
    public level: number = 1,
    public rent: number = 0,
    public lastCollected: number = 0
  ) {}
}
```

### 2. Game Events

```typescript
// Event base class
abstract class GameEvent {
  abstract readonly type: string;
  readonly timestamp: number = Date.now();
}

// Specific events
class BuildingConstructedEvent extends GameEvent {
  readonly type = 'BUILDING_CONSTRUCTED';
  
  constructor(
    public readonly playerId: string,
    public readonly buildingId: string,
    public readonly buildingType: BuildingType,
    public readonly position: { x: number; y: number }
  ) {
    super();
  }
}

class RentCollectedEvent extends GameEvent {
  readonly type = 'RENT_COLLECTED';
  
  constructor(
    public readonly playerId: string,
    public readonly buildingId: string,
    public readonly amount: number
  ) {
    super();
  }
}

// Event handler
class EventBus {
  private handlers = new Map<string, Array<(event: GameEvent) => void>>();
  
  subscribe<T extends GameEvent>(eventType: string, handler: (event: T) => void): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as (event: GameEvent) => void);
  }
  
  publish(event: GameEvent): void {
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }
}
```

---

## 📋 Checklist de Code Review

### ✅ Antes de Commit

- [ ] **Linting**: `yarn lint` pasa sin errores
- [ ] **Tests**: `yarn test` pasa al 100%
- [ ] **Types**: No hay `any` sin justificación
- [ ] **Naming**: Sigue convenciones establecidas
- [ ] **Comments**: Código complejo está documentado
- [ ] **Performance**: No hay loops innecesarios o memory leaks
- [ ] **Security**: No hay secrets hardcodeados
- [ ] **Logging**: Eventos importantes están loggeados

### ✅ Durante Code Review

- [ ] **Arquitectura**: Sigue patrones establecidos
- [ ] **Responsabilidad**: Cada función tiene una responsabilidad clara
- [ ] **Error Handling**: Todos los errores están manejados
- [ ] **Testing**: Casos edge están cubiertos
- [ ] **Documentation**: README actualizado si es necesario
- [ ] **Breaking Changes**: Están documentados y versionados
- [ ] **Performance**: No introduce regresiones
- [ ] **Accessibility**: UI es accesible (si aplica)

---

## 🚀 Comandos de Desarrollo

```bash
# Linting y formatting
yarn lint              # Ejecutar linting
yarn lint:fix          # Corregir errores automáticamente
yarn format            # Formatear código con Prettier

# Testing
yarn test              # Tests unitarios
yarn test:watch        # Tests en modo watch
yarn test:coverage     # Coverage report
yarn test:e2e          # Tests end-to-end

# Type checking
yarn type-check        # Verificar tipos TypeScript
yarn type-check:watch  # Type checking en modo watch

# Build
yarn build             # Build de producción
yarn build:analyze     # Analizar bundle size

# Development
yarn dev               # Servidor de desarrollo
yarn dev:debug         # Desarrollo con debugging
```

---

**Mantenimiento**: Revisar y actualizar cada sprint  
**Enforcement**: Configurar pre-commit hooks para validación automática  
**Evolución**: Proponer cambios via ADR cuando sea necesario