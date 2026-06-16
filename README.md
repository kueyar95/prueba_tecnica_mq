# Prueba Técnica Fullstack

Stack: Django + DRF + PostgreSQL + Docker + Next.js

## Objetivo

Construir un módulo de conciliación de pagos de arriendo con flujo completo:

```txt
Frontend (Next.js) -> API (Django) -> PostgreSQL -> Frontend
```

Buscamos ver cómo modelas un dominio real, cómo estructuras el backend y el frontend,
y qué criterio aplicas cuando el enunciado no lo define todo. Puedes (y se espera que)
uses IA, pero evaluamos tu pensamiento crítico sobre lo que produce.

## Requisitos previos

- Docker Desktop
- Python 3.11+
- Node.js 20+
- Yarn
- PDM

## Setup

### 1) Base de datos

```bash
docker compose --file "docker-compose.yml" up -d
```

### 2) Backend

```bash
cd backend
cp .env.example .env
pdm install
pdm migrate
pdm dev
```

Backend: `http://localhost:8000`

### 3) Frontend

```bash
cd frontend
cp .env.example .env.local
yarn install
yarn dev
```

Frontend: `http://localhost:3000/tasks`

## Contexto del dominio

Cada mes generamos los cobros de arriendo
de cada contrato, y por otro lado recibimos transferencias bancarias reales. El trabajo
operativo consiste en **conciliar**: decidir qué transferencias pagan qué cobros.

Dos conceptos:

- **Collection**: un monto mensual cobrado por arriendo. Tiene una moneda propia
(CLP o UF). Ejemplo: el arriendo de abril 2026 del contrato 123, por UF 2.
  ```json
  {
    "contract_id": 123,
    "mes_cobro": "2026-04-01",
    "monto_cobro": 2,
    "moneda": "UF"
  }
  ```
- **BankMovement**: una transferencia real recibida. **Siempre en CLP**, monto > 0.

La relación entre ambos es de many-to-many:

- Un cobro puede pagarse en varias transferencias (pago parcial / fraccionado).
- Una transferencia puede pagar varios cobros.

## Reglas de negocio

- **Conversión de moneda**: las transferencias siempre llegan en CLP. Para pagar un
cobro en UF, usa una **UF fija de $40.000**.
- **Cuánto falta por pagar** se determina comparando lo abonado contra el monto del
cobro, **en la moneda original del cobro**. No basta con sumar pesos: un cobro en UF
está pagado cuando lo abonado equivale a su monto en UF.
- **Sobrepagos**: si una transferencia aporta más de lo que el cobro necesita, el  
excedente queda como **saldo a favor** (no se pierde, no bloquea la operación).

## Modelos

Estos son los campos **mínimos**. Puedes (y probablemente necesitarás) agregar modelos y campos adicionales.

`Collection`

- `collection_id`
- `contract_id`
- `mes_cobro`
- `monto_cobro`
- `moneda` (CLP o UF)

`BankMovement`

- `bank_movement_id`
- `fecha`
- `glosa`
- `monto` (CLP, > 0)

## Backend

Implementar modelos, migraciones, serializers, views y urls.

Como mínimo, la API debe permitir:

- Crear y listar `Collection`.
- Crear y listar `BankMovement`.
- Asociar **un** `BankMovement` a uno o más `Collection` para pagarlos
(incluyendo pagos parciales).
- Consultar el histórico de cobros, distinguiendo los pendientes de los pagados, y
para los que tienen pagos, el detalle de qué transferencias los pagaron y con cuánto.

El diseño de rutas y recursos es tuyo. Mantén el alcance funcional descrito.

## Frontend

Implementar como mínimo:

- Crear `Collection` y `BankMovement`.
- Flujo de conciliación: tomar un `BankMovement` y asignarlo a uno o más cobros,
indicando cuánto se abona a cada uno.
- Histórico de cobros: pendientes y pagados, y para cada cobro con pagos, el detalle
de su pago (qué transferencias, cuánto cada una).
- Loading y error básico.

## Reglas técnicas

- Usar `NEXT_PUBLIC_API_URL`.
- Usar `styled-components`.
- En TypeScript, no usar `any`.
- No cambiar el setup base del repositorio.

## Entregables

1. Código funcional.
2. Lista de funcionalidades implementadas y pendientes.
3. Breve explicación del flujo de datos end-to-end.
4. **Supuestos y preguntas**: lista los supuestos que tomaste donde el enunciado no era
  explícito, y las preguntas que le harías al equipo de producto antes de llevar esto
   a producción.

-------------------------------------------------------------------------------------------------------------------

## Entrega

Resumen de la solución implementada.

## Cómo correr

```bash
docker compose up -d                                   # PostgreSQL
cd backend && cp .env.example .env && pdm install && pdm migrate && pdm dev   # API :8000
cd frontend && cp .env.example .env.local && yarn install && yarn dev         # UI :3000
cd backend && pdm test                                 # 38 tests
```

UI en `http://localhost:3000` (redirige a `/cobros`).

## Rutas

### API

- `GET/POST /api/collections/` y `GET /api/collections/{id}/`
- `GET/POST /api/bank-movements/` y `GET /api/bank-movements/{id}/`
- `POST /api/bank-movements/{id}/abonos/` para conciliar (una transferencia a uno o más cobros)
- `POST /api/bank-movements/{id}/devoluciones/` para devolver el excedente

### UI

`/cobros`, `/cobros/{id}`, `/transferencias`, `/transferencias/{id}`, `/transferencias/{id}/conciliar`. `/` y `/tasks` redirigen a `/cobros`.

## Funcionalidades

### Implementadas

Backend (Django + DRF, 38 tests):

- Crear y listar cobros y transferencias, con el detalle de cada uno.
- Conciliar: asociar una transferencia a uno o más cobros con montos parciales, dentro de una transacción atómica que valida que no se sobregire el movimiento y que cada abono no supere lo que falta del cobro.
- Devolver el excedente al pagador.
- Histórico de cobros con estado pendiente, parcial o pagado (filtrable) y, para cada cobro con pagos, el detalle de qué transferencias lo pagaron y con cuánto.
- Conversión de UF fija ($40.000) y cálculo de lo pagado en la moneda original del cobro, comparando en CLP para no perder pesos por redondeo.
- Dinero en `Decimal`, respuestas de error con formato uniforme, paginación y 404 limpios.

Frontend (Next.js 14, App Router):

- Histórico de cobros con filtro por estado y paginación.
- Crear cobro y crear transferencia.
- Detalle de cobro con el desglose de qué transferencias lo pagaron.
- Listado de transferencias con su saldo disponible, y detalle con sus abonos y devoluciones.
- Flujo de conciliación con balance en vivo que valida lo que falta y el saldo disponible.
- Devolución del excedente.
- Estados de carga y error por ruta. CLP como moneda principal y UF como referencia.

### Pendientes

- Aplicar automáticamente el saldo a favor a cobros futuros del contrato.
- UF variable por fecha (hoy es fija).
- Devolución completa con cliente, cuentas bancarias y ejecución real.
- Reversar o corregir conciliaciones con auditoría.
- Autenticación y roles (hoy `AllowAny`).
- Calcular estado y saldo en SQL para grandes volúmenes (hoy se hace en Python).
- Tests de frontend.

## Flujo de datos

`Frontend (Next.js) -> API (Django) -> PostgreSQL -> Frontend`

- Lectura: una página (Server Component) hace `fetch` a la API en el servidor usando `NEXT_PUBLIC_API_URL`; DRF lee de PostgreSQL y serializa incluyendo los campos derivados (estado, lo que falta, saldo); el Server Component renderiza y los Client Components con styled-components dan la interactividad.
- Escritura (por ejemplo, conciliar): el formulario invoca una Server Action que hace `POST` a la API; el servicio de Django ejecuta la operación en una transacción atómica (bloquea las filas con `select_for_update`, valida y crea los abonos) y responde; la Server Action revalida la ruta y la UI se refresca.
- Errores: el backend responde con un objeto de error con código y mensaje; el cliente lo convierte en una excepción y las acciones lo devuelven para mostrarlo en pantalla; un recurso inexistente cae en `notFound()` y cada ruta tiene su `loading` y su `error`.

## Supuestos

- El saldo a favor es el saldo disponible de la transferencia (su monto menos lo abonado y lo devuelto) y se puede aplicar a cualquier cobro, así el excedente no se pierde ni bloquea nada. Al ser un valor derivado no hay un crédito guardado aparte que se pueda desincronizar.
- Guardo el pagador en la transferencia para poder devolver un sobrepago a quien corresponde. No monté una entidad Cliente con cuentas bancarias porque para esta prueba basta con saber a quién se le devuelve.
- Trabajo y muestro todo en CLP. Para decidir si un cobro en UF está pagado multiplico su monto por la UF fija y comparo en CLP, en vez de dividir el CLP a UF, porque dividir arrastra redondeos y multiplicando la comparación es exacta.
- Todo el dinero va en `Decimal` y nunca en `float`, porque es plata de terceros y `float` introduce errores de representación.
- Los estados de un cobro son pendiente, parcial y pagado. El enunciado solo pide distinguir pendiente de pagado, pero agregué parcial porque saber cuánto falta es útil en el histórico y sale del mismo cálculo.
- El mes de cobro se normaliza al día 1, porque el cobro es mensual y fijar el día evita ambigüedades y duplicados al comparar meses entre contratos.
- Mantuve el setup base del repo, como pide el enunciado, y como el diseño de rutas es libre expongo rutas por dominio (`/api/collections/`, `/api/bank-movements/`) en lugar del placeholder `tasks`, que era de otro dominio.
- Dejé la autenticación fuera de alcance (`AllowAny`) porque así viene el scaffold y el enunciado no la pide. En producción iría con autorización por rol.