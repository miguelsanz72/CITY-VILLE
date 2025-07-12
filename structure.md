# Plan principal para recrear **CityVille** en 2025

> Documento de referencia técnico–estratégico  
> Versión 1.0 · 11‑jul‑2025

---

## 1. Objetivos del proyecto

1. **Revivir la experiencia de CityVille** con la misma jugabilidad (energía, bienes, vecinos, misiones) pero usando tecnologías modernas y multiplataforma (web + móviles).
2. Alcanzar **100 000 usuarios concurrentes** con latencia \< 150 ms por acción.
3. Diseñar una arquitectura **cloud‑nativa** y económicamente escalable (coste \< 0,006 USD por usuario/mes en producción estable).
4. Permitir lanzamiento continuo de contenido (eventos semanales) sin downtime.

---

## 2. Requerimientos técnicos

| Dominio         | Meta                              | Comentarios                  |
| --------------- | --------------------------------- | ---------------------------- |
| Concurrencia    | 100 k jugadores simultáneos       | Picos de 10 k acciones/s     |
| Latencia        | \< 150 ms RTT                     | Experiencia “clic‑respuesta” |
| Tiempo de carga | \< 5 s en 4G                      | Primer render interactivo    |
| Plataformas     | Web + PWA, iOS, Android           | Un solo código base          |
| Escalabilidad   | Horizontal, sin downtime          | K8s + autoscaling            |
| Seguridad       | Autoridad servidor, HMAC, TLS 1.3 | Prevención de cheats         |

---

## 3. Stack tecnológico

| Capa           | Tecnología                                          | Motivo principal              |
| -------------- | --------------------------------------------------- | ----------------------------- |
| Cliente        | **PixiJS v8** (2D WebGL) + ECS propia en TypeScript | Rendimiento y contratación JS |
| UI             | **React 19** (HUD) + Vite 6                         | SPA + Server Components       |
| Networking     | **Colyseus 2** (WebSocket)                          | Rooms, estado delta           |
| Backend core   | **NestJS v12** (Node 22)                            | DI, módulos, testing          |
| Microservicios | **Go 1.23** (gRPC)                                  | Throughput alto               |
| Persistencia   | **PostgreSQL 16 (Citus)** + Redis 7                 | SQL distribuido + caché       |
| Mensajería     | **NATS JetStream**                                  | Pub/Sub + event sourcing      |
| Auth           | tRPC + OAuth 2.1 (**Keycloak**)                     | Tipado end‑to‑end             |
| DevOps         | GitHub Actions → Docker → Argo CD → AKS/EKS         | CI/CD declarativo             |
| Observabilidad | OpenTelemetry + Grafana / Loki / Tempo              | Trazas, métricas, logs        |
| CDN/Assets     | Cloudflare R2 + Workers                             | Edge caching                  |

---

## 4. Arquitectura lógica

```mermaid
flowchart TD
    subgraph Frontend
        Player[PixiJS Game Client]
        HUD[React HUD]
        SW(Service Worker Cache)
    end
    Player -- WS --> GS(Game Server · Colyseus)
    HUD <-- tRPC --> API(API Gateway · NestJS)
    GS <--> Redis[(Redis Cluster)]
    GS <--> NATS[NATS JetStream]
    subgraph Microservices (Go)
        ECON(Economy)
        QUEST(Quests)
        SOCIAL(Social)
    end
    ECON & QUEST & SOCIAL -- gRPC --> PG[(PostgreSQL Citus)]
    ECON & QUEST & SOCIAL -- Pub/Sub --> NATS
    API -- OAuth --> KEYC(Keycloak)
    Cloudflare -. assets .- Player
    TEL(Tempo/Grafana) --- GS & ECON & QUEST
```

---

## 5. Estructura del repositorio (Nx monorepo + yarn)

```bash
cityville/
├─ apps/
│  ├─ game-client/           # PixiJS + ECS
│  ├─ game-server/           # Colyseus rooms
│  └─ api-gateway/           # NestJS BFF (tRPC)
├─ services/
│  ├─ economy/               # Go microservice
│  ├─ quests/
│  └─ social/
├─ packages/
│  ├─ ecs-core/              # Motor ECS compartido
│  ├─ ui-react/              # HUD y componentes
│  ├─ proto/                 # *.proto + código generado
│  └─ config/                # eslint, tsconfig, jest
├─ infra/
│  ├─ helm/                  # Charts K8s
│  └─ terraform/             # Red, DBaaS, CDN
├─ scripts/
│  ├─ seed-db.ts
│  └─ migrate.sql
├─ .github/workflows/ci.yml
└─ package.json              # workspaces y comandos
```

---

## 6. Flujo de jugabilidad (servidor = autoridad)

1. El cliente envía `collectRent` por WebSocket.
2. **Game Server** valida energía/estado en Redis y aplica lógica determinista.
3. Publica `rent_collected` en NATS → **Economy** actualiza monedas/XP y **Quests** avanza progreso.
4. Ambos emiten `state_updated`; el Game Server envía el delta JSON al jugador.

---

## 7. Dimensión inicial de infraestructura

| Componente       | Instancias mínimas        | Tipo       | Justificación             |
| ---------------- | ------------------------- | ---------- | ------------------------- |
| Game Server      | 4 pods                    | c6a.large  | ~2 000 conexiones por pod |
| API Gateway      | 2 pods                    | c6a.medium | Tráfico REST              |
| Redis            | 3 nodes                   | r6g.large  | 1 GB / 100 k usuarios     |
| PostgreSQL Citus | 1 coordinator + 3 workers | r6g.xlarge | Sharding por `user_id`    |
| NATS JetStream   | 3 pods                    | c6a.medium | Alta disponibilidad       |

---

## 8. Roadmap de implementación

| Sprint | Meta                                           |
| ------ | ---------------------------------------------- |
| 0      | Set‑up monorepo, CI/CD, contratos proto‑tRPC   |
| 1–2    | Motor ECS + tablero 24×24 + sistema de energía |
| 3–4    | Bienes, negocios, economía balanceada          |
| 5      | Social básico (visitas, franquicias)           |
| 6      | Eventos temáticos y monetización (IAP)         |
| Beta   | 10 k usuarios, feature‑flags con LaunchDarkly  |
| GA     | D7 retention ≥ 35 % y ARPU > 0,20 USD          |

---

## 9. Riesgos y mitigaciones

| Riesgo            | Impacto | Mitigación                                    |
| ----------------- | ------- | --------------------------------------------- |
| Sobrecoste nube   | Alto    | Migrar a spot‑instances y auto‑scale agresivo |
| Cheating cliente  | Medio   | Autoridad servidor, firmas HMAC               |
| Deriva de balance | Medio   | Telemetría + sandboxes A/B rápidos            |
| Burnout equipo    | Medio   | Sprints de 2 semanas, rotación de roles       |

---

**Contactos clave**

- **Tech Lead:** Miguel Sanz – miguel@divisi.com
- **Product Owner:** TBD
- **DevOps:** TBD

_Fin del documento_
