# Architecture Decision Records (ADR) - CityVille 2025

> **Registro de Decisiones Arquitectónicas**: Documentación formal de decisiones técnicas importantes para referencia de modelos de IA.

---

## ADR-001: Adopción de Arquitectura de Microservicios

**Fecha**: 2025-01-11  
**Estado**: ✅ Aceptado  
**Decidido por**: Equipo de Arquitectura (IA)  

### Contexto
Necesitamos una arquitectura que soporte 100k usuarios concurrentes con latencia <150ms y que permita escalado horizontal automático.

### Decisión
Adoptar arquitectura de microservicios con los siguientes servicios:
- **game-server**: Colyseus para tiempo real
- **api-gateway**: NestJS como BFF (Backend for Frontend)
- **economy**: Microservicio Go para lógica económica
- **quests**: Microservicio Go para misiones
- **social**: Microservicio Go para interacciones sociales

### Alternativas Consideradas
1. **Monolito modular**: Más simple pero no escala horizontalmente
2. **Serverless**: Latencia impredecible para gaming
3. **Event-driven puro**: Complejidad de debugging

### Consecuencias
**Positivas:**
- Escalado independiente por servicio
- Tecnologías específicas por dominio
- Aislamiento de fallos
- Equipos independientes (IAs)

**Negativas:**
- Complejidad de red
- Consistencia eventual
- Debugging distribuido
- Overhead de comunicación

### Métricas de Validación
- Latencia P95 < 150ms ✅
- Throughput > 10k requests/sec ⏳
- Uptime > 99.9% ⏳

---

## ADR-002: PixiJS como Motor de Renderizado 2D

**Fecha**: 2025-01-11  
**Estado**: ✅ Aceptado  
**Decidido por**: Equipo Frontend (IA)  

### Contexto
Necesitamos renderizar un mundo 2D con cientos de edificios, animaciones fluidas y efectos visuales manteniendo 60 FPS en dispositivos de gama media.

### Decisión
Utilizar **PixiJS v8** como motor de renderizado principal con WebGL como backend.

### Alternativas Consideradas
1. **Canvas 2D nativo**: Rendimiento insuficiente
2. **Three.js**: Overhead innecesario para 2D
3. **Phaser**: Menos control sobre rendering pipeline
4. **React Canvas**: No optimizado para gaming

### Implementación
```typescript
// Estructura de renderizado
class GameRenderer {
  private app: PIXI.Application;
  private worldContainer: PIXI.Container;
  private uiContainer: PIXI.Container;
  
  constructor() {
    this.app = new PIXI.Application({
      width: 1920,
      height: 1080,
      antialias: true,
      resolution: window.devicePixelRatio
    });
  }
}
```

### Consecuencias
**Positivas:**
- 60 FPS estables en dispositivos objetivo
- WebGL acceleration automática
- Ecosistema maduro de plugins
- Sprites batching automático

**Negativas:**
- Bundle size +2MB
- Curva de aprendizaje para desarrolladores React
- Debugging más complejo que DOM

### Métricas de Validación
- FPS promedio > 55 ✅
- Tiempo de carga < 5s ⏳
- Memoria < 50MB ⏳

---

## ADR-003: Entity Component System (ECS) Personalizado

**Fecha**: 2025-01-11  
**Estado**: ✅ Aceptado  
**Decidido por**: Equipo Game Engine (IA)  

### Contexto
Necesitamos una arquitectura de juego que permita composición flexible de entidades (edificios, decoraciones, NPCs) y sistemas modulares.

### Decisión
Implementar un ECS personalizado en TypeScript optimizado para nuestro caso de uso específico.

### Alternativas Consideradas
1. **bitECS**: Muy performante pero API compleja
2. **ecsy**: Descontinuado
3. **Objetos tradicionales**: No escalable
4. **Inheritance hierarchy**: Rígido y propenso a errores

### Implementación
```typescript
// Core ECS interfaces
interface Entity {
  id: string;
  components: Map<string, Component>;
}

interface Component {
  type: string;
  data: Record<string, any>;
}

interface System {
  requiredComponents: string[];
  update(entities: Entity[], deltaTime: number): void;
}

// Ejemplo de uso
class PositionComponent implements Component {
  type = 'position';
  data = { x: 0, y: 0, z: 0 };
}

class RenderSystem implements System {
  requiredComponents = ['position', 'sprite'];
  
  update(entities: Entity[], deltaTime: number) {
    entities.forEach(entity => {
      const pos = entity.components.get('position');
      const sprite = entity.components.get('sprite');
      // Update sprite position
    });
  }
}
```

### Consecuencias
**Positivas:**
- Composición flexible de entidades
- Sistemas reutilizables
- Fácil testing unitario
- Performance optimizada para nuestro caso

**Negativas:**
- Desarrollo inicial más lento
- Debugging más complejo
- Curva de aprendizaje

### Métricas de Validación
- 1000+ entidades sin degradación ⏳
- Tiempo de update < 16ms ⏳
- Memoria por entidad < 1KB ⏳

---

## ADR-004: PostgreSQL con Citus para Persistencia

**Fecha**: 2025-01-11  
**Estado**: ✅ Aceptado  
**Decidido por**: Equipo Backend (IA)  

### Contexto
Necesitamos una base de datos que soporte:
- 100k usuarios concurrentes
- Transacciones ACID para economía del juego
- Sharding automático para escalabilidad
- Queries complejas para analytics

### Decisión
Utilizar **PostgreSQL 16 con extensión Citus** para sharding distribuido automático.

### Alternativas Consideradas
1. **MongoDB**: Consistencia eventual problemática para economía
2. **MySQL Cluster**: Complejidad operacional
3. **CockroachDB**: Latencia alta en transacciones
4. **Redis como DB principal**: Limitaciones de queries

### Configuración
```sql
-- Sharding por user_id
SELECT create_distributed_table('players', 'user_id');
SELECT create_distributed_table('buildings', 'user_id');
SELECT create_distributed_table('transactions', 'user_id');

-- Tablas de referencia (replicadas)
SELECT create_reference_table('building_types');
SELECT create_reference_table('quest_templates');
```

### Consecuencias
**Positivas:**
- ACID garantizado
- Sharding transparente
- SQL familiar
- Herramientas maduras

**Negativas:**
- Complejidad de setup
- Costo de licencia Citus
- Joins cross-shard limitados

### Métricas de Validación
- Throughput > 50k TPS ⏳
- Latencia P95 < 10ms ⏳
- Disponibilidad > 99.9% ⏳

---

## ADR-005: NATS JetStream para Event Sourcing

**Fecha**: 2025-01-11  
**Estado**: ✅ Aceptado  
**Decidido por**: Equipo Backend (IA)  

### Contexto
Necesitamos un sistema de mensajería que soporte:
- Event sourcing para auditabilidad
- Pub/Sub para comunicación entre microservicios
- Persistencia para replay de eventos
- Ordenamiento garantizado por usuario

### Decisión
Utilizar **NATS JetStream** como backbone de mensajería con streams por dominio.

### Alternativas Consideradas
1. **Apache Kafka**: Overhead operacional alto
2. **Redis Streams**: Limitaciones de escalabilidad
3. **RabbitMQ**: No optimizado para event sourcing
4. **AWS EventBridge**: Vendor lock-in

### Configuración
```bash
# Streams por dominio
nats stream add ECONOMY --subjects="economy.*" --retention=interest --storage=file
nats stream add SOCIAL --subjects="social.*" --retention=interest --storage=file
nats stream add QUESTS --subjects="quests.*" --retention=interest --storage=file

# Consumers por servicio
nats consumer add ECONOMY economy-service --filter="economy.*" --deliver=all
```

### Consecuencias
**Positivas:**
- Event sourcing nativo
- Replay de eventos
- Ordenamiento garantizado
- Baja latencia

**Negativas:**
- Ecosistema menos maduro que Kafka
- Herramientas de monitoring limitadas
- Curva de aprendizaje

### Métricas de Validación
- Throughput > 100k msgs/sec ⏳
- Latencia < 1ms ⏳
- Durabilidad 100% ⏳

---

## ADR-006: tRPC para Type-Safe APIs

**Fecha**: 2025-01-11  
**Estado**: ✅ Aceptado  
**Decidido por**: Equipo Full-Stack (IA)  

### Contexto
Necesitamos APIs type-safe entre frontend y backend para:
- Eliminar errores de runtime por tipos incorrectos
- Autocompletado en desarrollo
- Refactoring seguro
- Documentación automática

### Decisión
Utilizar **tRPC v10** para todas las APIs HTTP entre cliente y api-gateway.

### Alternativas Consideradas
1. **GraphQL**: Overhead de queries complejas
2. **OpenAPI + codegen**: Sincronización manual
3. **REST puro**: Sin type safety
4. **gRPC-Web**: Complejidad de setup

### Implementación
```typescript
// Backend (NestJS)
export const appRouter = router({
  getPlayerStats: publicProcedure
    .input(z.object({ playerId: z.string() }))
    .query(async ({ input }) => {
      return await playerService.getStats(input.playerId);
    }),
    
  collectRent: publicProcedure
    .input(z.object({ buildingId: z.string() }))
    .mutation(async ({ input }) => {
      return await economyService.collectRent(input.buildingId);
    })
});

// Frontend (React)
const { data: stats } = trpc.getPlayerStats.useQuery({ playerId: '123' });
const collectMutation = trpc.collectRent.useMutation();
```

### Consecuencias
**Positivas:**
- Type safety end-to-end
- Autocompletado automático
- Refactoring seguro
- Bundle size pequeño

**Negativas:**
- Acoplamiento TypeScript
- Ecosistema menos maduro
- Debugging más complejo

### Métricas de Validación
- 0 errores de tipo en runtime ✅
- Tiempo de desarrollo -30% ⏳
- Bugs de API -80% ⏳

---

## ADR-007: Colyseus para Real-Time Gaming

**Fecha**: 2025-01-11  
**Estado**: ✅ Aceptado  
**Decidido por**: Equipo Real-Time (IA)  

### Contexto
Necesitamos un servidor de tiempo real que maneje:
- Rooms automáticas por ciudad
- Sincronización de estado delta
- Reconexión automática
- Autoridad del servidor

### Decisión
Utilizar **Colyseus v0.15** como servidor de juego en tiempo real.

### Alternativas Consideradas
1. **Socket.io**: Manejo manual de rooms y estado
2. **WebRTC**: Complejidad P2P innecesaria
3. **Custom WebSocket**: Reinventar la rueda
4. **Photon**: Vendor lock-in y costo

### Implementación
```typescript
// Server
class CityRoom extends Room<CityState> {
  onCreate(options: any) {
    this.setState(new CityState());
    
    this.onMessage("collect_rent", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player.energy >= message.cost) {
        player.energy -= message.cost;
        player.coins += message.reward;
        // Broadcast change
      }
    });
  }
}

// Client
const room = await client.joinOrCreate("city", { playerId });
room.onStateChange((state) => {
  // Update game state
});
```

### Consecuencias
**Positivas:**
- Rooms automáticas
- Delta compression
- Reconexión robusta
- Autoridad servidor

**Negativas:**
- Vendor lock-in parcial
- Debugging complejo
- Limitaciones de customización

### Métricas de Validación
- 2000 conexiones por instancia ⏳
- Latencia < 50ms ⏳
- Reconexión < 2s ⏳

---

## ADR-008: Kubernetes para Orquestación

**Fecha**: 2025-01-11  
**Estado**: ✅ Aceptado  
**Decidido por**: Equipo DevOps (IA)  

### Contexto
Necesitamos orquestación de contenedores que soporte:
- Auto-scaling horizontal
- Rolling deployments
- Service discovery
- Health checks
- Multi-cloud portability

### Decisión
Utilizar **Kubernetes** (AKS/EKS) con **Helm** para gestión de charts y **Argo CD** para GitOps.

### Alternativas Consideradas
1. **Docker Swarm**: Funcionalidades limitadas
2. **Nomad**: Ecosistema menos maduro
3. **ECS/Fargate**: Vendor lock-in AWS
4. **VM tradicionales**: No cloud-native

### Configuración
```yaml
# HPA para game-server
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: game-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: game-server
  minReplicas: 2
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: websocket_connections
      target:
        type: AverageValue
        averageValue: "1500"
```

### Consecuencias
**Positivas:**
- Auto-scaling automático
- Zero-downtime deployments
- Multi-cloud portability
- Ecosistema maduro

**Negativas:**
- Complejidad operacional
- Curva de aprendizaje
- Overhead de recursos

### Métricas de Validación
- Uptime > 99.9% ⏳
- Tiempo de deployment < 5min ⏳
- Recovery time < 30s ⏳

---

## Plantilla para Nuevas ADRs

```markdown
## ADR-XXX: [Título de la Decisión]

**Fecha**: YYYY-MM-DD  
**Estado**: 🔄 Propuesto | ✅ Aceptado | ❌ Rechazado | ⚠️ Deprecado  
**Decidido por**: [Equipo/IA responsable]  

### Contexto
[Descripción del problema o necesidad]

### Decisión
[Qué se decidió hacer]

### Alternativas Consideradas
1. **Opción A**: [Pros/Contras]
2. **Opción B**: [Pros/Contras]

### Implementación
[Código o configuración relevante]

### Consecuencias
**Positivas:**
- [Beneficio 1]
- [Beneficio 2]

**Negativas:**
- [Costo 1]
- [Riesgo 2]

### Métricas de Validación
- [Métrica 1] ⏳
- [Métrica 2] ✅
```

---

**Mantenimiento**: Actualizar estado de métricas cada sprint  
**Revisión**: Evaluar decisiones deprecadas cada 6 meses  
**Formato**: Una ADR por decisión arquitectónica significativa