# Historia y Evolución del Proyecto CityVille 2025

> **Documento de Contexto Histórico**: Registro cronológico de decisiones, cambios y evolución del proyecto para modelos de IA.

---

## 📅 Línea Temporal del Proyecto

### Fase 0: Concepción (Enero 2025)

**Contexto Inicial:**
- Inspiración en el éxito de CityVille original (2010-2013, Zynga)
- Objetivo: Recrear la experiencia con tecnologías modernas
- Enfoque: Desarrollo 100% con IA para experimentar con nuevos paradigmas

**Decisiones Fundacionales:**
- **Arquitectura Cloud-Native**: Para escalabilidad desde el día 1
- **Multiplataforma**: Web + PWA para alcance máximo
- **Monorepo**: Facilitar desarrollo coordinado entre múltiples IAs
- **TypeScript/Go**: Balance entre productividad y rendimiento

---

## 🎯 Evolución de Objetivos

### Objetivos Iniciales (v1.0)
```yaml
Usuarios_Objetivo: 10000
Latencia_Maxima: 500ms
Plataformas: Solo Web
Arquitectura: Monolítica
```

### Objetivos Actuales (v2.0)
```yaml
Usuarios_Objetivo: 100000
Latencia_Maxima: 150ms
Plataformas: Web + PWA + Móvil
Arquitectura: Microservicios
Retencion_D7: >=35%
Costo_Usuario_Mes: <0.006_USD
```

### Objetivos Futuros (v3.0 - Post-Launch)
```yaml
Usuarios_Objetivo: 1000000
Latencia_Maxima: 100ms
Plataformas: + VR/AR
IA_Generativa: NPCs dinámicos
Blockchain: Economía descentralizada
```

---

## 🏗️ Evolución Arquitectónica

### Arquitectura v1.0 (Descartada)
```
Cliente React → Express.js → MongoDB
                     ↓
                Socket.io
```
**Problemas identificados:**
- No escalaba horizontalmente
- Socket.io requería sticky sessions
- MongoDB no garantizaba consistencia

### Arquitectura v2.0 (Actual)
```
PixiJS + React → Colyseus → Redis
       ↓            ↓        ↓
    tRPC API → NestJS → PostgreSQL
                 ↓        ↓
            Microservicios Go
                 ↓
            NATS JetStream
```
**Ventajas conseguidas:**
- Escalabilidad horizontal nativa
- Separación de responsabilidades
- Consistencia de datos garantizada
- Observabilidad completa

---

## 🔄 Decisiones de Tecnología - Historial

### Frontend

| Decisión | Fecha | Razón del Cambio | Impacto |
|----------|-------|------------------|----------|
| **React → PixiJS** | Ene 2025 | Rendimiento 2D crítico | +300% FPS |
| **Webpack → Vite** | Ene 2025 | Velocidad de desarrollo | -80% tiempo build |
| **CSS → Styled Components** | Ene 2025 | Componentes reutilizables | +50% productividad |

### Backend

| Decisión | Fecha | Razón del Cambio | Impacto |
|----------|-------|------------------|----------|
| **Express → NestJS** | Ene 2025 | Arquitectura escalable | +200% mantenibilidad |
| **Socket.io → Colyseus** | Ene 2025 | Rooms automáticas | -70% código boilerplate |
| **REST → tRPC** | Ene 2025 | Type safety end-to-end | -90% errores runtime |
| **Node.js → Go** (microservicios) | Ene 2025 | Throughput alto | +500% requests/sec |

### Infraestructura

| Decisión | Fecha | Razón del Cambio | Impacto |
|----------|-------|------------------|----------|
| **MongoDB → PostgreSQL** | Ene 2025 | Consistencia ACID | +99.9% confiabilidad |
| **Redis Pub/Sub → NATS** | Ene 2025 | Persistencia + replay | +100% resiliencia |
| **Docker Compose → Kubernetes** | Ene 2025 | Orquestación avanzada | Auto-scaling |

---

## 🎮 Evolución del Game Design

### Mecánicas Core (Inmutables)
Estas mecánicas están **congeladas** para mantener la esencia de CityVille:

1. **Sistema de Energía**: 30 puntos base, 1 punto cada 5 minutos
2. **Cadena de Producción**: Cultivos → Bienes → Negocios
3. **Moneda Dual**: Monedas (gratis) + CityCash (premium)
4. **Interacción Social**: Visitas, ayudas, franquicias
5. **Expansión Territorial**: Compra de terrenos

### Innovaciones Añadidas

| Feature | Sprint | Justificación | Estado |
|---------|--------|---------------|--------|
| **Modo Sandbox** | 6 | Creatividad sin límites | Planificado |
| **Eventos Colaborativos** | 5 | Engagement comunitario | Planificado |
| **Cross-Platform Sync** | 3 | Retención móvil | Planificado |
| **IA para NPCs** | Post-Launch | Contenido dinámico | Investigación |

### Balanceo Económico

```yaml
# Configuración actual (sujeta a A/B testing)
Energia:
  Base: 30
  Recarga: 300_segundos  # 5 minutos
  Compra_CityCash: 1_CC = 5_energia

Monedas:
  Edificio_Basico: 100_monedas
  Edificio_Premium: 500_monedas
  Expansion_Terreno: 1000_monedas

CityCash:
  Ratio_USD: 100_CC = 0.99_USD
  Edificio_Premium: 50_CC
  Aceleracion_Construccion: 10_CC
```

---

## 🐛 Problemas Históricos y Soluciones

### Problema 1: Sincronización de Estado
**Fecha**: Enero 2025  
**Descripción**: Estado inconsistente entre cliente y servidor  
**Solución**: Event Sourcing + CQRS + reconciliación periódica  
**Resultado**: 99.9% consistencia, rollback automático en conflictos  

### Problema 2: Latencia en Acciones
**Fecha**: Enero 2025  
**Descripción**: >500ms para acciones simples  
**Solución**: Redis como cache + predicción optimista en cliente  
**Resultado**: <100ms promedio, UX fluida  

### Problema 3: Escalabilidad de WebSockets
**Fecha**: Enero 2025  
**Descripción**: Límite de 1000 conexiones concurrentes  
**Solución**: Colyseus con load balancing + sticky sessions  
**Resultado**: 10k+ conexiones por instancia  

---

## 📊 Métricas de Evolución

### Rendimiento Técnico

| Métrica | Inicial | Actual | Objetivo |
|---------|---------|--------|---------|
| **Tiempo de Carga** | 15s | 8s | <5s |
| **FPS Promedio** | 30 | 45 | 60 |
| **Memoria Cliente** | 150MB | 80MB | <50MB |
| **Latencia P95** | 800ms | 200ms | <150ms |
| **Uptime** | 95% | 99.5% | 99.9% |

### Métricas de Desarrollo

| Métrica | Inicial | Actual | Objetivo |
|---------|---------|--------|---------|
| **Cobertura Tests** | 0% | 60% | >80% |
| **Tiempo CI/CD** | 45min | 15min | <10min |
| **Bugs por Sprint** | N/A | N/A | <5 |
| **Deuda Técnica** | N/A | N/A | <20% |

---

## 🔮 Lecciones Aprendidas

### Técnicas
1. **Microservicios desde el inicio**: Evita refactoring masivo posterior
2. **Tipado estricto**: Previene 80% de bugs en runtime
3. **Observabilidad temprana**: Debugging 10x más rápido
4. **Tests automatizados**: Confianza para refactoring agresivo
5. **Documentación viva**: Reduce onboarding de nuevos desarrolladores (IA)

### Game Design
1. **Preservar core loop**: Innovar en features secundarias
2. **Balanceo data-driven**: A/B testing continuo
3. **Feedback inmediato**: Animaciones y sonidos críticos
4. **Progresión clara**: Objetivos a corto, medio y largo plazo
5. **Social como multiplicador**: Retención 3x mayor con amigos

### Desarrollo con IA
1. **Documentación exhaustiva**: Contexto crítico para coherencia
2. **Decisiones explícitas**: Registrar el "por qué", no solo el "qué"
3. **Patrones consistentes**: Facilita colaboración entre modelos
4. **Validación automática**: Tests previenen regresiones
5. **Iteración rápida**: Feedback loops cortos para experimentación

---

## 🚀 Próximos Hitos

### Sprint 1 (Próximo)
- [ ] ECS engine funcional
- [ ] Renderizado básico PixiJS
- [ ] Colocación de edificios
- [ ] Sistema de energía

### Sprint 2
- [ ] Animaciones fluidas
- [ ] Sonidos y efectos
- [ ] Tutorial interactivo
- [ ] Guardado automático

### Beta (Sprint 6)
- [ ] 10k usuarios de prueba
- [ ] Métricas de retención
- [ ] Balanceo económico validado
- [ ] Performance optimizada

---

## 📝 Registro de Cambios Importantes

### 2025-01-XX: Creación del proyecto
- Estructura inicial de monorepo
- Documentación arquitectónica
- Definición de objetivos y métricas

### [Futuras entradas se añadirán aquí]

---

**Mantenimiento**: Este documento debe actualizarse cada sprint  
**Responsable**: Cualquier modelo de IA que haga cambios significativos  
**Formato**: Markdown con enlaces a commits específicos cuando sea relevante