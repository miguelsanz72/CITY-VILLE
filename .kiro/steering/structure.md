# Project Structure & Organization

## Monorepo Layout

The project follows a domain-driven monorepo structure with clear separation between applications, shared packages, and microservices.

```
cityville/
├── apps/                    # Main applications
│   ├── api-gateway/        # NestJS API gateway (Node.js + TypeScript)
│   ├── game-client/        # React frontend with PixiJS (TypeScript)
│   └── game-server/        # Colyseus real-time game server (Node.js + TypeScript)
├── packages/               # Shared libraries and utilities
│   ├── config/            # Shared configuration and constants
│   ├── ecs-core/          # Entity Component System implementation
│   ├── proto/             # Protocol Buffer definitions for gRPC
│   └── ui-react/          # Reusable React UI components
├── services/              # Go microservices
│   ├── economy/           # Economic system (transactions, balance)
│   ├── quests/            # Quest and mission system
│   └── social/            # Social features (friends, gifts)
├── docs/                  # Technical documentation
├── scripts/               # Database migrations and utility scripts
└── infra/                 # Infrastructure as Code (not yet implemented)
    ├── helm/              # Kubernetes Helm charts
    └── terraform/         # Cloud infrastructure definitions
```

## Application Structure

### Frontend (`apps/game-client/`)
```
src/
├── components/            # React components
│   ├── ui/               # Basic UI components (Button, Input, Modal)
│   ├── game/             # Game-specific components (BuildingCard, CityGrid)
│   └── layout/           # Layout components (Header, Sidebar)
├── pages/                # Route-based page components
├── hooks/                # Custom React hooks
├── services/             # API clients and business logic
├── stores/               # Zustand state management
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── constants/            # Application constants
└── assets/               # Static assets (images, sounds, fonts)
```

### Backend API (`apps/api-gateway/`)
```
src/
├── controllers/          # HTTP request handlers
├── services/             # Business logic layer
├── repositories/         # Data access layer
├── dto/                  # Data Transfer Objects
├── entities/             # Database entity definitions
├── middleware/           # Custom middleware (auth, logging, etc.)
├── config/               # Application configuration
└── utils/                # Utility functions
```

### Game Server (`apps/game-server/`)
```
src/
├── rooms/                # Colyseus room definitions
├── schemas/              # Game state schemas
├── systems/              # Game logic systems
├── handlers/             # Message handlers
└── utils/                # Server utilities
```

### Go Microservices (`services/*/`)
```
cmd/
└── server/               # Application entry point
internal/
├── domain/               # Business entities and logic
├── repository/           # Data access implementations
├── service/              # Business service layer
├── handler/              # gRPC/HTTP handlers
├── middleware/           # Custom middleware
└── config/               # Service configuration
pkg/                      # Public packages (if any)
api/                      # API definitions (protobuf)
```

## Shared Packages

### ECS Core (`packages/ecs-core/`)
- Entity Component System implementation
- Core game entities (Player, Building, etc.)
- Component definitions and systems
- Event sourcing utilities

### Protocol Buffers (`packages/proto/`)
- gRPC service definitions
- Message schemas for inter-service communication
- Generated TypeScript and Go code

### UI Components (`packages/ui-react/`)
- Reusable React components
- Design system implementation
- Storybook documentation
- Theme and styling utilities

### Configuration (`packages/config/`)
- Shared constants and enums
- Environment configuration
- Database schemas
- API contracts and types

## Naming Conventions

### Files and Directories
- **kebab-case** for file and directory names
- **PascalCase** for React components and classes
- **camelCase** for functions and variables
- **SCREAMING_SNAKE_CASE** for constants

### Package Naming
- All packages use scoped naming: `@cityville/package-name`
- Apps: `@cityville/api-gateway`, `@cityville/game-client`, etc.
- Packages: `@cityville/ecs-core`, `@cityville/ui-react`, etc.

### Import Organization
```typescript
// 1. Node modules
import React from 'react';
import { Router } from 'express';

// 2. Internal packages
import { Player } from '@cityville/ecs-core';
import { Button } from '@cityville/ui-react';

// 3. Relative imports
import { GameService } from '../services/game.service';
import { PlayerComponent } from './PlayerComponent';
```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches
- `hotfix/*` - Critical production fixes

### Code Organization Principles
1. **Domain-Driven Design**: Group code by business domain, not technical layer
2. **Dependency Direction**: Dependencies flow inward (UI → Services → Domain)
3. **Single Responsibility**: Each module has one clear purpose
4. **Explicit Dependencies**: Use dependency injection, avoid global state
5. **Type Safety**: Leverage TypeScript's type system throughout

### Testing Structure
```
__tests__/                # Test files alongside source code
├── unit/                 # Unit tests
├── integration/          # Integration tests
└── e2e/                  # End-to-end tests
```

## Configuration Management

### Environment Variables
- `.env.example` - Template with all required variables
- `.env.local` - Local development overrides (gitignored)
- Environment-specific configs in deployment

### Feature Flags
- Centralized feature flag management
- Environment-based feature toggles
- A/B testing capabilities

## Documentation Standards

### Code Documentation
- JSDoc for TypeScript functions and classes
- README.md in each package/app
- Architecture Decision Records (ADRs) in `docs/`

### API Documentation
- OpenAPI/Swagger for REST APIs
- Protocol Buffer documentation for gRPC
- tRPC generates type-safe client documentation

This structure supports the AI-first development approach by providing clear boundaries, consistent patterns, and well-defined interfaces between components.
