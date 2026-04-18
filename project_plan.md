# Sistema de Reservas para Mini Cines Privados

## 1. Descripción del Proyecto
Sistema web de reservas para mini cines privados que permite a los usuarios alquilar salas por hora según su capacidad. Dirigido a clientes que desean una experiencia de cine privada e íntima. El sistema incluye un panel administrativo para gestionar salas, precios y reservas.

## 2. Estructura de Páginas
- `/` - Home: Presentación del negocio, salas destacadas, CTA de reserva
- `/reservas` - Reservas: Selección de sala, fecha, hora y duración
- `/admin` - Admin: Panel administrativo (login + dashboard)

## 3. Funcionalidades Principales
- [ ] Página Home con hero, salas y características
- [ ] Listado de salas con disponibilidad
- [ ] Formulario de reserva (sala, fecha, hora, duración, cliente)
- [ ] Cálculo automático del costo total
- [ ] Validación de disponibilidad (sin solapamiento)
- [ ] Login de administrador (credenciales: admin/admin)
- [ ] CRUD de salas en panel admin
- [ ] Visualización de todas las reservas en admin
- [ ] Bloqueo de horarios por el administrador

## 4. Modelo de Datos (Mock)

### Salas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| nombre | string | Nombre de la sala |
| capacidad | number | Personas (1-2 pequeña, 3-10 grande) |
| tipo | 'pequena' \| 'grande' | Tipo de sala |
| precio | number | Precio por hora en Bs |
| estado | 'disponible' \| 'mantenimiento' | Estado actual |
| imagen | string | URL de imagen |

### Reservas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| sala_id | number | Referencia a sala |
| cliente | string | Nombre del cliente |
| fecha | string | Fecha (YYYY-MM-DD) |
| hora_inicio | string | Hora inicio (HH:MM) |
| hora_fin | string | Hora fin (HH:MM) |
| total | number | Costo total en Bs |

## 5. Integración Backend / Terceros
- Supabase: No conectado (fase actual usa datos mock)
- Shopify: No requerido
- Stripe: No requerido
- Backend PHP/MySQL: Planeado para fase futura

## 6. Plan de Desarrollo

### Fase 1: UI Principal (ACTUAL)
- Goal: Construir las 3 páginas con UI completa y datos mock
- Entregable: Home, Reservas y Admin funcionales con diseño completo

### Fase 2: Persistencia de Datos (FUTURA)
- Goal: Conectar con Supabase para almacenar reservas y salas reales
- Entregable: CRUD real de salas y reservas con base de datos

### Fase 3: Mejoras y Escalabilidad (FUTURA)
- Goal: Notificaciones, estadísticas, pagos online
- Entregable: Sistema completo listo para producción
