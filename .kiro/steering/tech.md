# Technology Stack

## Build System & Monorepo
- **Monorepo Management**: Nx + Turborepo for efficient builds and caching
- **Package Manager**: Yarn 4.0+ with workspaces
- **Build Tools**: Webpack 5, Vite (development), Babel
- **Task Runner**: Turbo for parallel execution and caching

## Frontend Stack
- **Framework**: React 18+ with TypeScript 5+
- **Graphics Engine**: PixiJS v8 for WebGL-powered 2D rendering
- **Build Tool**: Vite for fast development, Webpack for production
- **State Management**: Zustand + React Query for server state
- **Styling**: CSS Modules + PostCSS
- **UI Components**: Custom component library in `packages/ui-react`

## Backend Stack
- **API Gateway**: NestJS with Express (Node.js + TypeScript)
- **Game Server**: Colyseus v0.15 for real-time multiplayer WebSocket connections
- **Microservices**: Go 1.23+ with Gin framework for high-performance services
- **API Type Safety**: tRPC for end-to-end type safety between frontend and backend
- **Protocol Buffers**: For efficient communication between Go microservices

## Database & Storage
- **Primary Database**: PostgreSQL 16+ with Citus extension for horizontal sharding
- **Cache Layer**: Redis for session management and game state caching
- **Message Queue**: NATS JetStream for event sourcing and inter-service communication
- **File Storage**: AWS S3 or compatible object storage

## Infrastructure & DevOps
- **Containerization**: Docker + Docker Compose for local development
- **Orchestration**: Kubernetes (AKS/EKS) with Helm charts
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Monitoring**: Prometheus + Grafana + Jaeger for observability
- **Logging**: Structured logging with Winston (Node.js) and slog (Go)

## Development Tools
- **Linting**: ESLint + Prettier for code formatting
- **Testing**: Jest (unit), Playwright (E2E), Go testing framework
- **Type Checking**: TypeScript strict mode enabled
- **Git Hooks**: Husky + lint-staged for pre-commit validation
- **Code Quality**: SonarQube integration, security scanning

## Common Commands

### Development
```bash
# Start all services in development mode
yarn dev:all

# Start individual services
yarn dev:client    # React frontend with Vite
yarn dev:server    # Colyseus game server
yarn dev:api       # NestJS API gateway
yarn dev:services  # Go microservices via Docker

# Database operations
yarn db:migrate    # Run database migrations
yarn db:seed       # Seed with test data
yarn db:reset      # Reset database
```

### Building & Testing
```bash
# Build all packages and apps
yarn build:all

# Run tests
yarn test:unit     # Unit tests with Jest
yarn test:e2e      # End-to-end tests with Playwright
yarn test:coverage # Generate coverage reports

# Code quality
yarn lint          # Run ESLint
yarn format        # Format with Prettier
yarn type-check    # TypeScript type checking
```

### Docker & Infrastructure
```bash
# Local development with Docker
yarn docker:build # Build all Docker images
yarn docker:up    # Start services with docker-compose
yarn docker:down  # Stop all services

# Kubernetes deployment
yarn k8s:deploy           # Deploy to development
yarn k8s:deploy:staging   # Deploy to staging
yarn k8s:deploy:prod      # Deploy to production
```

## Environment Configuration
Copy `.env.example` to `.env` and configure:
- Database connection strings (PostgreSQL, Redis)
- External service APIs (authentication, payments)
- Feature flags and game configuration
- Development vs production settings

## Performance Targets
- **Frontend**: 60 FPS rendering, <5s initial load time
- **Backend**: <150ms API response time, 2000+ concurrent WebSocket connections per instance
- **Database**: <10ms query latency, 50k+ transactions per second
- **Infrastructure**: 99.9% uptime, auto-scaling based on load
