# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CityVille 2025 is a modern city-building game developed entirely by AI. It's a monorepo using Nx workspace management with TypeScript/React frontend, Node.js backend, and Go microservices.

## Architecture

- **Frontend**: React 19 + PixiJS + Vite (game-client)
- **Backend**: NestJS API Gateway + Colyseus Game Server + Go microservices
- **Database**: PostgreSQL with Citus for sharding + Redis for caching
- **Message Queue**: NATS JetStream for event sourcing
- **Monorepo**: Nx workspace with Yarn workspaces

### Key Directories

```
apps/
├── api-gateway/     # NestJS API Gateway
├── game-client/     # React + PixiJS game client
└── game-server/     # Colyseus WebSocket server

packages/
├── config/          # Shared configuration
├── ecs-core/        # Entity Component System
├── proto/           # Protocol Buffers definitions
└── ui-react/        # Shared React components

services/
├── economy/         # Go microservice for economic system
├── quests/          # Go microservice for quest system
└── social/          # Go microservice for social features

docs/                # Comprehensive technical documentation
```

## Development Commands

### Primary Development
```bash
# Start all services in development
yarn dev:all

# Individual services
yarn dev:client      # Vite dev server for game client
yarn dev:server      # Colyseus game server with watch
yarn dev:api         # NestJS API Gateway with watch
yarn dev:services    # Docker compose for Go services

# Build all apps and packages
yarn build:all
```

### Database Operations
```bash
yarn db:migrate      # Run database migrations
yarn db:seed         # Seed database with test data
yarn db:reset        # Reset database completely
yarn db:studio       # Open database studio
```

### Code Quality
```bash
yarn lint            # ESLint with auto-fix
yarn lint:check      # ESLint check only
yarn format          # Prettier formatting
yarn format:check    # Prettier check only
yarn type:check      # TypeScript type checking
```

### Testing
```bash
yarn test:unit       # Jest unit tests
yarn test:e2e        # Playwright end-to-end tests
yarn test:coverage   # Coverage reports
```

### Infrastructure
```bash
yarn docker:build   # Build Docker images
yarn docker:up      # Start Docker services
yarn docker:down    # Stop Docker services
yarn k8s:deploy     # Deploy to Kubernetes
```

## Core Technologies & Patterns

### Game Architecture
- **ECS (Entity Component System)**: Modular game object architecture
- **Event Sourcing**: All game state changes recorded as events
- **CQRS**: Command Query Responsibility Segregation
- **Authoritative Server**: All game logic runs on server

### Development Patterns
- **Monorepo**: Nx workspace for efficient development
- **Microservices**: Go services for scalable backend
- **WebSocket**: Real-time multiplayer with Colyseus
- **Protocol Buffers**: Type-safe service communication

### Code Standards
- **TypeScript**: Strict typing, no `any` without justification
- **Naming**: camelCase variables, PascalCase classes, SCREAMING_SNAKE_CASE constants
- **Testing**: Jest for unit tests, Playwright for E2E
- **Linting**: ESLint + Prettier configured for consistency

## Game Design Context

### Core Mechanics
- **City Building**: Place buildings, roads, decorations on 24x24 grid
- **Resource Management**: Coins, CityCash (premium), Energy, Population
- **Energy System**: Limited actions per session (like original CityVille)
- **Economic Chain**: Crops → Goods → Businesses → Rent collection
- **Social Features**: Visit friends' cities, gifts, franchise businesses

### Technical Requirements
- **Performance**: 60 FPS on medium devices, <100ms latency
- **Scalability**: Designed for 100k concurrent users
- **Security**: Server-authoritative, anti-cheat measures
- **Observability**: Structured logging, metrics, tracing

## Key Files & Configuration

### Configuration Files
- `package.json`: Root workspace configuration with all scripts
- `nx.json`: Nx workspace configuration with caching and task runners
- `jest.config.js`: Jest testing configuration
- `playwright.config.ts`: E2E testing configuration
- `docker-compose.dev.yml`: Development Docker services

### Documentation
- `docs/AI_DEVELOPMENT_GUIDE.md`: Critical AI development instructions
- `docs/TECHNICAL_CONTEXT.md`: API schemas, contracts, patterns
- `docs/CODING_STANDARDS.md`: Code style and conventions
- `docs/ARCHITECTURE_DECISIONS.md`: Technical decision records

## Important Notes

### For AI Development
- **Always read documentation first**: Especially AI_DEVELOPMENT_GUIDE.md
- **Follow established patterns**: Check existing code before implementing
- **Maintain consistency**: Use established naming and structure conventions
- **Test thoroughly**: Run linting, type checking, and tests before commits
- **Security first**: Never hardcode secrets, validate all inputs

### Project Status
This is an experimental project developed entirely by AI. The current focus is on:
1. Core game engine with ECS architecture
2. Basic city building mechanics
3. Real-time multiplayer infrastructure
4. Economic system implementation

### Environment Setup
1. Copy `.env.example` to `.env`
2. Run `yarn install` to install dependencies
3. Use `yarn dev:all` to start all services
4. Services will be available at documented ports

The project uses Yarn 4 as package manager and requires Node.js 18+.