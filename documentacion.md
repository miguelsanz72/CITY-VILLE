# Documentación general del proyecto **CityVille 2025**

> Última actualización: 11‑jul‑2025

---

## 1. Visión y objetivos

Recrear la experiencia clásica de **CityVille** utilizando tecnologías modernas y un modelo _cloud‑native_, ofreciendo jugabilidad multiplataforma (web + móvil) y un pipeline de contenidos continuos que garantice **retención ≥ 35 % D7**.

Objetivos clave:

1. Lanzamiento MVP en **6 sprints** (ver hoja de ruta en [`structure.md`](./structure.md)).
2. Escalar a **100 000 usuarios concurrentes** con latencia \< 150 ms.
3. Minimizar coste operativo a \< 0,006 USD/usuario/mes.
4. Fomentar una comunidad cooperativa mediante funciones sociales (visitas, franquicias, expediciones).

---

## 2. Público objetivo y propuesta de valor

| Segmento                | Edad  | Motivación                  | Valor diferencial                                     |
| ----------------------- | ----- | --------------------------- | ----------------------------------------------------- |
| Jugadores nostálgicos   | 25‑40 | Revivir CityVille           | Mecánicas idénticas + eventos temáticos retro         |
| Casual mobile           | 18‑34 | Sesiones cortas             | PWA + notificaciones push + energías gratis al volver |
| Constructores creativos | 12‑45 | Diseñar ciudades elaboradas | Modo `Sandbox` y editor de barrios colaborativo       |

---

## 3. Mecánicas principales

1. **Energía** – Límite base 30 pts, recarga 1 pt/5 min.
2. **Bienes** – Cultivos, barcos y trenes → abastecen negocios.
3. **Monedas & CityCash** – Economía dual para progresión y monetización.
4. **Misiones y colecciones** – Guían la expansión y otorgan recompensas.
5. **Interacción social** – Visitar vecinos, franquiciar negocios, chat de clubes.
6. **Eventos temporales** – Contenido limitado semanal (festividades, expediciones).

---

## 4. Arquitectura técnica (resumen)

El detalle exhaustivo se encuentra en [`structure.md`](./structure.md).  
Resumen de capas:

| Capa               | Tecnología                      | Rol                        |
| ------------------ | ------------------------------- | -------------------------- |
| **Cliente**        | PixiJS v8 + React 19 + Vite 6   | Render 2D WebGL + HUD      |
| **Red**            | Colyseus 2 (WebSocket)          | Rooms, sync delta          |
| **Backend**        | NestJS v12 (Node 22)            | Gateway API tRPC           |
| **Microservicios** | Go 1.23 + gRPC                  | Economía, misiones, social |
| **Persistencia**   | PostgreSQL 16 (Citus) + Redis 7 | SQL distribuido + caché    |
| **Mensajería**     | NATS JetStream                  | Event sourcing, pub/sub    |
| **Infra**          | Docker, Helm, Argo CD, AKS/EKS  | CI/CD declarativo          |

---

## 5. Estructura del repositorio

```bash
cityville/
├─ apps/                # Clientes y servidores principales
├─ services/            # Microservicios Go
├─ packages/            # Bibliotecas compartidas
├─ infra/               # Terraform + Helm charts
├─ scripts/             # Migrations, seeds
└─ docs/                # (este archivo y futuras guías)
```

---

## 6. Flujo de desarrollo

1. **Branching**: `main` protegido, `develop` integración continua, ramas `feature/*`, `fix/*`.
2. **Commits**: Convencional Commits (`feat:`, `fix:`…).
3. **CI**: GitHub Actions
   - Lint + tests unitarios
   - Build Docker + SBOM
   - Publicación en GHCR
4. **CD**: Argo CD sincroniza `main` → cluster *K8s*.

---

## 7. Entorno de desarrollo local

Requisitos:

- Node ≥ 20, **yarn** (Berry), Go ≥ 1.23
- Docker Desktop + Kubernetes
- Nx CLI, Buf, Tilt (opcional para live‑reload k8s)

Pasos:

```bash
git clone git@github.com:divisi/cityville.git
cd cityville
yarn install            # instala workspaces
yarn proto:gen          # genera código gRPC/tRPC
yarn dev:all            # arranca cliente, game‑server y api‑gateway
```

---

## 8. Despliegue y operaciones

1. **Infra as Code**: Terraform aprovisiona VPC, RDS (PostgreSQL Citus), Redis Elasticache, AKS/EKS.
2. **Helm charts** (`infra/helm/*`) definen despliegue de:
   - `game-server`, `api-gateway`, microservicios, NATS, Redis.
3. **Observabilidad**: OpenTelemetry SDK → Tempo, Loki y Grafana.
4. **Alertas**: Prometheus Alertmanager + Slack.

---

## 9. Calidad, pruebas y seguridad

| Tipo       | Herramienta               | Cobertura          |
| ---------- | ------------------------- | ------------------ |
| Linting    | ESLint, Go Vet            | 100 % código       |
| Unit tests | Vitest, Go Test           | ≥ 80 % líneas      |
| E2E        | Playwright                | Flujos principales |
| Seguridad  | Snyk + Trivy              | SBOM y CVEs        |
| Anti‑cheat | Autoridad servidor + HMAC | Comandos firmados  |

---

## 10. Glosario rápido

- **DAU**: Daily Active Users
- **ECS**: Entity Component System
- **HPA**: Horizontal Pod Autoscaler
- **ARPU**: Average Revenue Per User

---

### Referencias internas

- [Hoja de ruta y riesgos](./structure.md#8-roadmap-de-implementación)
- [Plantillas de commits](./docs/commit-convention.md) _(TBD)_
- [Guía de estilo de código](./docs/coding-style.md) _(TBD)_

_Fin de documento_
