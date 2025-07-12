# Deployment y Operaciones - CityVille 2025

> **Guía Operacional Completa**: Deployment, configuración, monitoreo y troubleshooting para modelos de IA.

---

## 🚀 Estrategia de Deployment

### Entornos

```yaml
# Configuración de entornos
entornos:
  development:
    descripcion: "Desarrollo local con Docker Compose"
    base_url: "http://localhost"
    database: "PostgreSQL local"
    redis: "Redis local"
    observabilidad: "Jaeger local"
    
  staging:
    descripcion: "Entorno de pruebas en AKS"
    base_url: "https://staging.cityville.com"
    database: "Azure Database for PostgreSQL"
    redis: "Azure Cache for Redis"
    observabilidad: "Azure Monitor + Jaeger"
    
  production:
    descripcion: "Producción multi-región"
    base_url: "https://api.cityville.com"
    database: "PostgreSQL con Citus (sharding)"
    redis: "Redis Cluster"
    observabilidad: "Datadog + OpenTelemetry"
```

### GitOps Workflow

```mermaid
graph LR
    A[Developer Push] --> B[GitHub Actions]
    B --> C[Build & Test]
    C --> D[Build Images]
    D --> E[Push to Registry]
    E --> F[Update Helm Values]
    F --> G[Argo CD Sync]
    G --> H[Deploy to K8s]
    H --> I[Health Checks]
    I --> J[Rollback if Failed]
```

### Branching Strategy

```bash
# Estructura de branches
main/
├── develop/              # Desarrollo activo
├── feature/JIRA-123     # Features individuales
├── release/v1.2.0       # Preparación de releases
├── hotfix/critical-bug  # Fixes críticos
└── spike/research-topic # Investigación técnica

# Flujo de deployment
feature/* → develop → staging
release/* → main → production
hotfix/* → main → production (inmediato)
```

---

## 🐳 Configuración Docker

### Dockerfile Multi-stage

```dockerfile
# apps/api-gateway/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copiar dependencias y build
COPY --from=base /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json

# Security: no root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Docker Compose (Desarrollo)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Base de datos
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cityville_dev
      POSTGRES_USER: cityville
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/migrate.sql:/docker-entrypoint-initdb.d/01-migrate.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cityville"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Message Broker
  nats:
    image: nats:2.9-alpine
    ports:
      - "4222:4222"
      - "8222:8222"
    command: [
      "--jetstream",
      "--store_dir=/data",
      "--http_port=8222"
    ]
    volumes:
      - nats_data:/data

  # API Gateway
  api-gateway:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://cityville:dev_password@postgres:5432/cityville_dev
      - REDIS_URL=redis://redis:6379
      - NATS_URL=nats://nats:4222
      - JWT_SECRET=dev_jwt_secret_change_in_production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      nats:
        condition: service_started
    volumes:
      - ./apps/api-gateway/src:/app/src
    command: npm run dev

  # Game Server
  game-server:
    build:
      context: .
      dockerfile: apps/game-server/Dockerfile
    ports:
      - "2567:2567"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
      - API_GATEWAY_URL=http://api-gateway:3000
    depends_on:
      - redis
      - api-gateway
    volumes:
      - ./apps/game-server/src:/app/src
    command: npm run dev

  # Economy Service
  economy-service:
    build:
      context: .
      dockerfile: services/economy/Dockerfile
    ports:
      - "50051:50051"
    environment:
      - DATABASE_URL=postgresql://cityville:dev_password@postgres:5432/cityville_dev
      - NATS_URL=nats://nats:4222
      - LOG_LEVEL=debug
    depends_on:
      postgres:
        condition: service_healthy
      nats:
        condition: service_started

  # Observabilidad
  jaeger:
    image: jaegertracing/all-in-one:1.45
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

volumes:
  postgres_data:
  redis_data:
  nats_data:

networks:
  default:
    name: cityville_network
```

---

## ☸️ Configuración Kubernetes

### Helm Chart Structure

```yaml
# infra/helm/cityville/Chart.yaml
apiVersion: v2
name: cityville
description: CityVille 2025 Game Platform
type: application
version: 0.1.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: 12.1.9
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  
  - name: redis
    version: 17.3.7
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
  
  - name: nats
    version: 0.19.1
    repository: https://nats-io.github.io/k8s/helm/charts/
    condition: nats.enabled
```

### Values por Entorno

```yaml
# infra/helm/cityville/values-staging.yaml
global:
  environment: staging
  imageRegistry: acrcityville.azurecr.io
  imagePullSecrets:
    - name: acr-secret

api-gateway:
  replicaCount: 2
  image:
    repository: cityville/api-gateway
    tag: "staging-latest"
  
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
  
  env:
    NODE_ENV: staging
    LOG_LEVEL: info
    
  ingress:
    enabled: true
    className: nginx
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
      nginx.ingress.kubernetes.io/rate-limit: "100"
    hosts:
      - host: staging-api.cityville.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: staging-api-tls
        hosts:
          - staging-api.cityville.com

game-server:
  replicaCount: 3
  image:
    repository: cityville/game-server
    tag: "staging-latest"
  
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
  
  service:
    type: LoadBalancer
    port: 2567

economy-service:
  replicaCount: 2
  image:
    repository: cityville/economy-service
    tag: "staging-latest"
  
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"

# Dependencias externas
postgresql:
  enabled: true
  auth:
    postgresPassword: "staging_postgres_password"
    database: cityville_staging
  primary:
    persistence:
      size: 20Gi
      storageClass: managed-premium

redis:
  enabled: true
  auth:
    enabled: true
    password: "staging_redis_password"
  master:
    persistence:
      size: 8Gi
      storageClass: managed-premium

nats:
  enabled: true
  config:
    jetstream:
      enabled: true
      fileStore:
        pvc:
          size: 10Gi
          storageClassName: managed-premium
```

### Production Values

```yaml
# infra/helm/cityville/values-production.yaml
global:
  environment: production
  imageRegistry: acrcityville.azurecr.io

api-gateway:
  replicaCount: 5
  image:
    tag: "v1.0.0"  # Tag específico, no latest
  
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
  
  autoscaling:
    enabled: true
    minReplicas: 5
    maxReplicas: 20
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
  
  podDisruptionBudget:
    enabled: true
    minAvailable: 3

game-server:
  replicaCount: 10
  image:
    tag: "v1.0.0"
  
  resources:
    requests:
      memory: "1Gi"
      cpu: "1000m"
    limits:
      memory: "2Gi"
      cpu: "2000m"
  
  autoscaling:
    enabled: true
    minReplicas: 10
    maxReplicas: 50
    targetCPUUtilizationPercentage: 60
  
  nodeSelector:
    node-type: game-server
  
  tolerations:
    - key: "game-server"
      operator: "Equal"
      value: "true"
      effect: "NoSchedule"

# Base de datos externa (Azure Database)
postgresql:
  enabled: false  # Usar Azure Database for PostgreSQL

externalDatabase:
  host: cityville-prod.postgres.database.azure.com
  port: 5432
  database: cityville_production
  username: cityville_admin
  existingSecret: postgres-credentials
  existingSecretPasswordKey: password

# Redis externo (Azure Cache)
redis:
  enabled: false  # Usar Azure Cache for Redis

externalRedis:
  host: cityville-prod.redis.cache.windows.net
  port: 6380
  auth:
    enabled: true
    existingSecret: redis-credentials
    existingSecretPasswordKey: password
  tls:
    enabled: true
```

---

## 🔧 Variables de Entorno

### API Gateway

```bash
# apps/api-gateway/.env.example

# Aplicación
NODE_ENV=development
PORT=3000
SERVICE_NAME=api-gateway
SERVICE_VERSION=1.0.0

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/cityville_dev
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000

# Cache
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600
REDIS_MAX_RETRIES=3

# Messaging
NATS_URL=nats://localhost:4222
NATS_STREAM_NAME=GAME_EVENTS
NATS_CONSUMER_GROUP=api-gateway

# Autenticación
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Observabilidad
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=api-gateway
LOG_LEVEL=info

# Servicios externos
ECONOMY_SERVICE_URL=localhost:50051
QUEST_SERVICE_URL=localhost:50052
SOCIAL_SERVICE_URL=localhost:50053

# Game Server
GAME_SERVER_URL=ws://localhost:2567
GAME_SERVER_SECRET=shared-secret-between-services

# Seguridad
CORS_ORIGINS=http://localhost:3001,https://cityville.com
CSRF_SECRET=csrf-secret-key
HELMET_ENABLED=true

# Features flags
FEATURE_SOCIAL_ENABLED=true
FEATURE_EVENTS_ENABLED=true
FEATURE_ANALYTICS_ENABLED=true
```

### Game Server

```bash
# apps/game-server/.env.example

# Aplicación
NODE_ENV=development
PORT=2567
SERVICE_NAME=game-server

# Colyseus
COLYSEUS_MONITOR_ENABLED=true
COLYSEUS_MONITOR_PORT=2568
COLYSEUS_PRESENCE_DRIVER=redis
COLYSEUS_DRIVER=redis

# Redis (para Colyseus)
REDIS_URL=redis://localhost:6379

# API Gateway
API_GATEWAY_URL=http://localhost:3000
API_GATEWAY_SECRET=shared-secret-between-services

# Game Configuration
MAX_ROOMS=1000
MAX_PLAYERS_PER_ROOM=1
ROOM_TIMEOUT_MS=300000  # 5 minutos
PLAYER_TIMEOUT_MS=60000 # 1 minuto

# Performance
TICK_RATE=20  # 20 FPS server
STATE_SYNC_INTERVAL=100  # 100ms
DELTA_COMPRESSION=true

# Observabilidad
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=game-server
LOG_LEVEL=info

# Métricas de juego
METRICS_ENABLED=true
METRICS_INTERVAL=30000  # 30 segundos
```

### Microservicios Go

```bash
# services/economy/.env.example

# Aplicación
SERVICE_NAME=economy-service
SERVICE_VERSION=1.0.0
PORT=50051
ENVIRONMENT=development

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/cityville_dev
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_CONN_MAX_LIFETIME=300s

# NATS
NATS_URL=nats://localhost:4222
NATS_STREAM=GAME_EVENTS
NATS_CONSUMER_GROUP=economy-service
NATS_DURABLE_NAME=economy-consumer

# gRPC
GRPC_PORT=50051
GRPC_REFLECTION_ENABLED=true
GRPC_KEEPALIVE_TIME=30s
GRPC_KEEPALIVE_TIMEOUT=5s

# Observabilidad
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=economy-service
LOG_LEVEL=info
LOG_FORMAT=json

# Business Logic
MAX_TRANSACTION_AMOUNT=1000000
TRANSACTION_TIMEOUT=30s
RENT_CALCULATION_CACHE_TTL=300s

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_RPS=1000
RATE_LIMIT_BURST=2000
```

---

## 📊 Monitoreo y Alertas

### Prometheus Metrics

```yaml
# infra/helm/cityville/templates/servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: cityville-metrics
  labels:
    app: cityville
spec:
  selector:
    matchLabels:
      app: cityville
  endpoints:
    - port: metrics
      path: /metrics
      interval: 30s
      scrapeTimeout: 10s
```

### Alerting Rules

```yaml
# infra/helm/cityville/templates/prometheusrule.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: cityville-alerts
spec:
  groups:
    - name: cityville.rules
      rules:
        # Alta latencia en API
        - alert: HighAPILatency
          expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
          for: 2m
          labels:
            severity: warning
          annotations:
            summary: "High API latency detected"
            description: "95th percentile latency is {{ $value }}s"
        
        # Muchos errores 5xx
        - alert: HighErrorRate
          expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
          for: 1m
          labels:
            severity: critical
          annotations:
            summary: "High error rate detected"
            description: "Error rate is {{ $value | humanizePercentage }}"
        
        # Pocos jugadores activos
        - alert: LowActiveUsers
          expr: active_users < 100
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "Low number of active users"
            description: "Only {{ $value }} active users"
        
        # Base de datos lenta
        - alert: SlowDatabaseQueries
          expr: histogram_quantile(0.95, rate(database_query_duration_seconds_bucket[5m])) > 1.0
          for: 2m
          labels:
            severity: warning
          annotations:
            summary: "Slow database queries detected"
            description: "95th percentile query time is {{ $value }}s"
        
        # Redis desconectado
        - alert: RedisDown
          expr: redis_up == 0
          for: 1m
          labels:
            severity: critical
          annotations:
            summary: "Redis is down"
            description: "Redis instance is not responding"
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "CityVille - Game Metrics",
    "panels": [
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "active_users",
            "legendFormat": "Active Users"
          }
        ]
      },
      {
        "title": "Buildings Built per Hour",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(buildings_built_total[1h]) * 3600",
            "legendFormat": "Buildings/hour"
          }
        ]
      },
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          },
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate by Service",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) by (service)",
            "legendFormat": "{{ service }}"
          }
        ]
      }
    ]
  }
}
```

---

## 🔍 Troubleshooting

### Comandos de Diagnóstico

```bash
#!/bin/bash
# scripts/debug.sh

echo "=== CityVille Debug Information ==="

# Verificar estado de pods
echo "\n--- Pod Status ---"
kubectl get pods -n cityville -o wide

# Verificar logs de errores
echo "\n--- Recent Errors ---"
kubectl logs -n cityville -l app=api-gateway --tail=50 | grep ERROR

# Verificar conectividad de base de datos
echo "\n--- Database Connectivity ---"
kubectl exec -n cityville deployment/api-gateway -- \
  node -e "const { Client } = require('pg'); \
           const client = new Client(process.env.DATABASE_URL); \
           client.connect().then(() => console.log('DB OK')).catch(console.error)"

# Verificar Redis
echo "\n--- Redis Connectivity ---"
kubectl exec -n cityville deployment/api-gateway -- \
  node -e "const redis = require('redis'); \
           const client = redis.createClient(process.env.REDIS_URL); \
           client.ping().then(() => console.log('Redis OK')).catch(console.error)"

# Verificar métricas
echo "\n--- Key Metrics ---"
curl -s http://prometheus.monitoring.svc.cluster.local:9090/api/v1/query?query=active_users | jq '.data.result[0].value[1]'

# Verificar health checks
echo "\n--- Health Checks ---"
for service in api-gateway game-server economy-service; do
  echo "$service:"
  kubectl exec -n cityville deployment/$service -- curl -f http://localhost/health || echo "FAILED"
done
```

### Problemas Comunes

```yaml
# Runbook de problemas comunes
problemas_comunes:
  
  alta_latencia:
    sintomas:
      - "API response time > 500ms"
      - "Usuarios reportan lentitud"
    causas_posibles:
      - "Base de datos sobrecargada"
      - "Queries N+1"
      - "Cache miss alto"
      - "Red lenta"
    solucion:
      - "Verificar slow query log"
      - "Revisar hit rate de Redis"
      - "Escalar horizontalmente"
      - "Optimizar queries"
    comandos:
      - "kubectl top pods -n cityville"
      - "kubectl logs -f deployment/api-gateway | grep SLOW"
  
  usuarios_desconectados:
    sintomas:
      - "WebSocket connections dropping"
      - "Usuarios no pueden jugar"
    causas_posibles:
      - "Game server sobrecargado"
      - "Load balancer mal configurado"
      - "Sticky sessions no funcionan"
    solucion:
      - "Verificar logs de Colyseus"
      - "Revisar configuración de ingress"
      - "Escalar game servers"
    comandos:
      - "kubectl logs -f deployment/game-server"
      - "kubectl describe ingress game-server-ingress"
  
  transacciones_fallidas:
    sintomas:
      - "Economy service errors"
      - "Usuarios pierden monedas"
    causas_posibles:
      - "Deadlocks en base de datos"
      - "Timeout en transacciones"
      - "Inconsistencia de datos"
    solucion:
      - "Revisar logs de PostgreSQL"
      - "Verificar métricas de transacciones"
      - "Rollback manual si es necesario"
    comandos:
      - "kubectl exec postgres -- psql -c 'SELECT * FROM pg_stat_activity WHERE state = \'active\';'"
      - "kubectl logs -f deployment/economy-service | grep TRANSACTION"
```

### Scripts de Recuperación

```bash
#!/bin/bash
# scripts/emergency-recovery.sh

set -e

echo "🚨 Emergency Recovery Script"
echo "Choose recovery action:"
echo "1. Rollback to previous version"
echo "2. Scale down problematic service"
echo "3. Clear Redis cache"
echo "4. Restart all services"
echo "5. Database emergency backup"

read -p "Enter choice (1-5): " choice

case $choice in
  1)
    echo "Rolling back to previous version..."
    kubectl rollout undo deployment/api-gateway -n cityville
    kubectl rollout undo deployment/game-server -n cityville
    kubectl rollout status deployment/api-gateway -n cityville
    ;;
  2)
    read -p "Service to scale down: " service
    kubectl scale deployment/$service --replicas=0 -n cityville
    echo "Scaled down $service to 0 replicas"
    ;;
  3)
    echo "Clearing Redis cache..."
    kubectl exec deployment/redis -n cityville -- redis-cli FLUSHALL
    echo "Redis cache cleared"
    ;;
  4)
    echo "Restarting all services..."
    kubectl rollout restart deployment -n cityville
    kubectl rollout status deployment/api-gateway -n cityville
    ;;
  5)
    echo "Creating emergency database backup..."
    kubectl exec deployment/postgres -n cityville -- \
      pg_dump -U cityville cityville_production > "emergency-backup-$(date +%Y%m%d-%H%M%S).sql"
    echo "Backup created"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo "✅ Recovery action completed"
echo "📊 Current status:"
kubectl get pods -n cityville
```

---

## 🔐 Seguridad Operacional

### Secrets Management

```yaml
# infra/helm/cityville/templates/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: cityville-secrets
type: Opaque
data:
  # Valores codificados en base64
  jwt-secret: {{ .Values.secrets.jwtSecret | b64enc }}
  database-password: {{ .Values.secrets.databasePassword | b64enc }}
  redis-password: {{ .Values.secrets.redisPassword | b64enc }}
  
---
# Usar Azure Key Vault en producción
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: cityville-keyvault
spec:
  provider: azure
  parameters:
    usePodIdentity: "false"
    useVMManagedIdentity: "true"
    userAssignedIdentityID: "{{ .Values.azure.managedIdentityClientId }}"
    keyvaultName: "{{ .Values.azure.keyVaultName }}"
    objects: |
      array:
        - |
          objectName: jwt-secret
          objectType: secret
        - |
          objectName: database-password
          objectType: secret
```

### Network Policies

```yaml
# infra/helm/cityville/templates/networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: cityville-network-policy
spec:
  podSelector:
    matchLabels:
      app: cityville
  policyTypes:
    - Ingress
    - Egress
  
  ingress:
    # Permitir tráfico desde ingress controller
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
    
    # Permitir comunicación entre servicios
    - from:
        - podSelector:
            matchLabels:
              app: cityville
      ports:
        - protocol: TCP
          port: 50051  # gRPC
        - protocol: TCP
          port: 2567   # Game server
  
  egress:
    # Permitir acceso a base de datos
    - to:
        - podSelector:
            matchLabels:
              app: postgresql
      ports:
        - protocol: TCP
          port: 5432
    
    # Permitir acceso a Redis
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
    
    # Permitir DNS
    - to: []
      ports:
        - protocol: UDP
          port: 53
```

---

**Mantenimiento**: Revisar configuraciones mensualmente  
**Actualizaciones**: Seguir semantic versioning  
**Backups**: Automatizados diariamente con retención de 30 días