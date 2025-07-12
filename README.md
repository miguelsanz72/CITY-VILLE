# 🏙️ CityVille 2025 - AI-First Game Development Project

> **🤖 PROYECTO 100% DESARROLLADO CON INTELIGENCIA ARTIFICIAL**  
> Este es un proyecto experimental donde toda la programación, arquitectura y desarrollo es realizado exclusivamente por agentes de IA.

## 🎯 Misión del Proyecto

CityVille 2025 es un juego de simulación de ciudad moderno desarrollado completamente por IA, utilizando las mejores prácticas de desarrollo de software y arquitecturas escalables. El objetivo es demostrar las capacidades de la IA en el desarrollo de software complejo y crear un juego divertido y técnicamente sólido.

## 🤖 Instrucciones para Agentes de IA

### 📋 Contexto Principal
- **Tipo de Proyecto**: Juego de simulación de ciudad (City Builder)
- **Arquitectura**: Monorepo con microservicios
- **Frontend**: React + TypeScript + WebGL
- **Backend**: Node.js + Go microservices
- **Base de Datos**: PostgreSQL + Redis
- **Infraestructura**: Docker + Kubernetes + AWS

### 🎮 Características del Juego
- **Género**: City Builder / Simulación
- **Plataforma**: Web (navegador)
- **Multijugador**: Sí (tiempo real)
- **Gráficos**: 2.5D isométrico con WebGL
- **Monetización**: Free-to-play con compras opcionales

### 📁 Estructura del Proyecto

```
game/
├── apps/                    # Aplicaciones principales
│   ├── api-gateway/        # Gateway de APIs
│   ├── game-client/        # Cliente del juego (React)
│   └── game-server/        # Servidor del juego (Node.js)
├── packages/               # Paquetes compartidos
│   ├── config/            # Configuraciones compartidas
│   ├── ecs-core/          # Sistema ECS (Entity Component System)
│   ├── proto/             # Definiciones Protocol Buffers
│   └── ui-react/          # Componentes UI reutilizables
├── services/              # Microservicios (Go)
│   ├── economy/           # Sistema económico
│   ├── quests/            # Sistema de misiones
│   └── social/            # Sistema social
├── infra/                 # Infraestructura
│   ├── helm/              # Charts de Helm
│   └── terraform/         # Configuración de Terraform
└── docs/                  # Documentación técnica
```

### 🛠️ Stack Tecnológico

#### Frontend
- **Framework**: React 18 + TypeScript
- **Bundler**: Webpack 5 + Vite (desarrollo)
- **Gráficos**: Three.js + WebGL
- **Estado**: Zustand + React Query
- **Estilos**: CSS Modules + PostCSS
- **Testing**: Jest + Playwright + React Testing Library

#### Backend
- **API Gateway**: Node.js + Express + TypeScript
- **Game Server**: Node.js + Colyseus (WebSockets)
- **Microservicios**: Go + Gin + gRPC
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Message Queue**: RabbitMQ

#### DevOps & Infraestructura
- **Contenedores**: Docker + Docker Compose
- **Orquestación**: Kubernetes + Helm
- **CI/CD**: GitHub Actions
- **Cloud**: AWS (EKS, RDS, ElastiCache, S3)
- **Monitoreo**: Prometheus + Grafana + Jaeger
- **Logs**: ELK Stack

### 🎯 Objetivos de Desarrollo

#### Fase 1: Fundación (Actual)
- [x] Configuración del monorepo
- [x] Configuración de herramientas de desarrollo
- [ ] Estructura básica de aplicaciones
- [ ] Sistema ECS básico
- [ ] Configuración de base de datos

#### Fase 2: Core del Juego
- [ ] Motor de renderizado 2.5D
- [ ] Sistema de tiles y construcción
- [ ] Mecánicas básicas de ciudad
- [ ] Sistema de recursos
- [ ] Interfaz de usuario básica

#### Fase 3: Sistemas Avanzados
- [ ] Sistema económico
- [ ] Sistema de misiones
- [ ] Multijugador en tiempo real
- [ ] Sistema social
- [ ] Optimizaciones de rendimiento

#### Fase 4: Pulido y Lanzamiento
- [ ] Balanceo del juego
- [ ] Sistema de monetización
- [ ] Optimizaciones finales
- [ ] Testing exhaustivo
- [ ] Despliegue en producción

### 📚 Documentación Técnica

La documentación completa está disponible en el directorio `/docs/`:

- **[Contexto Técnico](docs/TECHNICAL_CONTEXT.md)**: Arquitectura y decisiones técnicas
- **[Contexto del Juego](docs/GAME_DESIGN_CONTEXT.md)**: Diseño y mecánicas del juego
- **[Estándares de Código](docs/CODING_STANDARDS.md)**: Convenciones y mejores prácticas
- **[Prácticas de Desarrollo](docs/DEVELOPMENT_PRACTICES.md)**: Flujo de trabajo y metodologías
- **[Decisiones de Arquitectura](docs/ARCHITECTURE_DECISIONS.md)**: ADRs y justificaciones
- **[Guía de Desarrollo con IA](docs/AI_DEVELOPMENT_GUIDE.md)**: Instrucciones específicas para agentes
- **[Despliegue y Operaciones](docs/DEPLOYMENT_OPERATIONS.md)**: Guías de DevOps

### 🤖 Instrucciones Específicas para Agentes

#### Antes de Empezar
1. **LEE TODA LA DOCUMENTACIÓN**: Especialmente `docs/AI_DEVELOPMENT_GUIDE.md`
2. **ENTIENDE EL CONTEXTO**: Revisa `docs/TECHNICAL_CONTEXT.md` y `docs/GAME_DESIGN_CONTEXT.md`
3. **SIGUE LOS ESTÁNDARES**: Aplica `docs/CODING_STANDARDS.md` en todo momento
4. **MANTÉN LA COHERENCIA**: Usa las convenciones establecidas en el proyecto

#### Principios de Desarrollo
- **Calidad sobre Velocidad**: Código limpio, bien documentado y testeado
- **Arquitectura Escalable**: Piensa en el futuro, diseña para crecer
- **Performance First**: Optimiza desde el principio, especialmente para gaming
- **Developer Experience**: Herramientas y procesos que faciliten el desarrollo
- **Security by Design**: Seguridad integrada desde el diseño

#### Flujo de Trabajo
1. **Analiza la tarea**: Entiende completamente lo que se necesita
2. **Revisa el código existente**: Mantén consistencia con lo ya implementado
3. **Planifica la implementación**: Diseña antes de codificar
4. **Implementa con calidad**: Código limpio, comentado y testeado
5. **Valida el resultado**: Asegúrate de que funciona correctamente
6. **Documenta los cambios**: Actualiza documentación si es necesario

#### Herramientas Disponibles
- **Linting**: ESLint, Stylelint, Prettier configurados
- **Testing**: Jest, Playwright, React Testing Library
- **Build**: Webpack, Babel, PostCSS configurados
- **Monorepo**: Nx y Turborepo para gestión eficiente
- **CI/CD**: GitHub Actions para automatización
- **Dependencias**: Renovate y Dependabot para actualizaciones

### 🚀 Comandos Principales

```bash
# Instalación inicial
npm install

# Desarrollo
npm run dev              # Inicia todos los servicios en desarrollo
npm run dev:client       # Solo cliente del juego
npm run dev:server       # Solo servidor del juego
npm run dev:gateway      # Solo API Gateway

# Build
npm run build            # Build de producción
npm run build:client     # Build solo del cliente
npm run build:server     # Build solo del servidor

# Testing
npm run test             # Tests unitarios
npm run test:e2e         # Tests end-to-end
npm run test:watch       # Tests en modo watch

# Calidad de código
npm run lint             # Linting
npm run format           # Formateo
npm run type-check       # Verificación de tipos

# Base de datos
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Poblar con datos de prueba
npm run db:reset         # Resetear base de datos

# Docker
npm run docker:build     # Build de imágenes Docker
npm run docker:up        # Levantar servicios con Docker
npm run docker:down      # Bajar servicios Docker

# Monorepo
npm run nx:graph         # Ver gráfico de dependencias
npm run turbo:build      # Build con Turborepo
```

### 🔧 Variables de Entorno

Copia `.env.example` a `.env` y configura las variables necesarias:

```bash
cp .env.example .env
```

Las variables están organizadas por categorías:
- **Aplicación**: Configuración general
- **Base de Datos**: PostgreSQL y Redis
- **Servicios Externos**: APIs de terceros
- **Características del Juego**: Configuraciones específicas
- **Desarrollo**: Herramientas de desarrollo
- **Producción**: Configuraciones de producción

### 🎮 Mecánicas del Juego

#### Core Gameplay
- **Construcción de Ciudad**: Colocar edificios, carreteras, decoraciones
- **Gestión de Recursos**: Población, dinero, energía, agua, felicidad
- **Economía**: Comercio, impuestos, presupuesto municipal
- **Crecimiento**: Expansión de la ciudad, desbloqueo de contenido
- **Desafíos**: Eventos aleatorios, objetivos, misiones

#### Sistemas Técnicos
- **ECS (Entity Component System)**: Arquitectura modular para entidades del juego
- **Pathfinding**: A* para navegación de ciudadanos
- **Simulación**: Sistemas de tráfico, economía, población
- **Networking**: Sincronización en tiempo real para multijugador
- **Persistencia**: Guardado automático y manual del progreso

### 🔒 Consideraciones de Seguridad

- **Validación**: Toda entrada del usuario debe ser validada
- **Autenticación**: JWT tokens para sesiones de usuario
- **Autorización**: Permisos granulares para acciones del juego
- **Rate Limiting**: Prevención de spam y ataques
- **Sanitización**: Limpieza de datos antes de almacenar
- **HTTPS**: Todas las comunicaciones encriptadas

### 📊 Monitoreo y Observabilidad

- **Métricas**: Prometheus para métricas de aplicación
- **Logs**: Structured logging con Winston
- **Tracing**: Jaeger para trazabilidad distribuida
- **Alertas**: Configuración de alertas para errores críticos
- **Dashboards**: Grafana para visualización de métricas

### 🤝 Contribución (Para Agentes)

1. **Mantén la Calidad**: Todo código debe pasar linting, tests y type-checking
2. **Documenta Cambios**: Actualiza documentación relevante
3. **Sigue Convenciones**: Usa los estándares establecidos
4. **Piensa en Escalabilidad**: Diseña para el futuro
5. **Optimiza Performance**: Especialmente importante para gaming
6. **Considera UX**: La experiencia del jugador es prioritaria

### 📞 Soporte y Recursos

- **Documentación**: Directorio `/docs/` con guías completas
- **Ejemplos**: Código de ejemplo en cada package
- **Configuración**: Archivos de configuración bien documentados
- **Scripts**: Automatización para tareas comunes
- **Herramientas**: Linting, testing, building configurados

---

## 🎯 Próximos Pasos para Agentes

1. **Revisar documentación técnica** en `/docs/`
2. **Configurar entorno de desarrollo** con `.env`
3. **Ejecutar tests** para verificar configuración
4. **Implementar funcionalidades** siguiendo las fases definidas
5. **Mantener calidad** con herramientas configuradas

**¡Bienvenido al futuro del desarrollo de videojuegos con IA! 🚀🎮**

---

*Este proyecto es un experimento en desarrollo de software completamente automatizado con IA. Cada línea de código, cada decisión de arquitectura, y cada optimización es realizada por agentes de inteligencia artificial trabajando de forma colaborativa.*