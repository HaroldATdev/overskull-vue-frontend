# Overskull Frontend - Gestion de Productos y Categorias (Vue 3 + Vite + Pinia)

SPA con **Vue 3 (Composition API)** que consume la API Laravel (`laravel-api`).
Incluye **Dashboard**, **Productos** (listado + crear/editar), **Categorias**
(listado + modal crear/editar) y **Auditoria**, con estados **loading / success / error**,
validaciones de formulario y notificaciones toast.

---

## 1. Caracteristicas

| Requerimiento | Implementacion |
|---|---|
| Framework | Vue 3 + Vite 8 |
| State Management | Pinia (products, categories, dashboard, activity-logs, toasts, loading) |
| Ruteo | Vue Router: `/`, `/productos`, `/productos/nuevo`, `/productos/:id/editar`, `/categorias`, `/auditoria`, 404 |
| Estilos | Tailwind CSS v4 (tema brand en `src/assets/main.css`) |
| HTTP | Axios con interceptores globales (`src/services/http.js`) |
| Formularios | `ProductForm` / `CategoryForm` + validadores (`src/utils/validators.js`) |
| Alertas | `ToastContainer` + store `toasts` (exito/error/info, autocierre 5 s) |
| Carga | `LoadingSpinner` + barra global `#global-loader` (store `loading` con contador) |
| Errores | `ApiError` + `normalizeError()` (`src/utils/errorHandler.js`): red, 4xx y 5xx en espanol |
| Docker | `Dockerfile` multietapa (build Vite + Nginx) + `docker-compose.yml` |

### Manejo de estados y errores

1. **Loading**: el interceptor request incrementa `loading.pending` (barra superior global).
   Cada vista muestra `LoadingSpinner` en la primera carga y deshabilita la paginacion.
2. **Success**: la API devuelve `{ success, message, data, meta }`; el interceptor
   desempaqueta `response.data` y los stores disparan `toasts.success(message)`.
3. **Error**: el interceptor response normaliza a `ApiError { status, message, errors }`,
   muestra `toasts.error(message)` y lo propaga. Las vistas muestran banner con
   boton **Reintentar**; los formularios pintan `errors` por campo (422 -> `toFieldErrors()`).

Validaciones implementadas: nombre requerido (min. 3), precio numerico mayor que 0
(max. 2 decimales), stock entero >= 0, categoria obligatoria.


```
vue-frontend/
├─ src/
│  ├─ assets/main.css            # Tailwind v4 + tema brand + loader global
│  ├─ components/                # ProductForm, CategoryForm, ConfirmDialog, ToastContainer,
│  │                             # LoadingSpinner, EmptyState, PaginationControls, StatCard
│  ├─ layouts/DefaultLayout.vue  # Sidebar + header por ruta + footer
│  ├─ views/                     # Dashboard, Products, ProductForm, Categories, ActivityLogs, NotFound
│  ├─ stores/                    # products, categories, dashboard, activityLogs, toasts, loading
│  ├─ services/                  # http.js (axios) + products/categories/dashboard.service.js
│  ├─ router/index.js             # Rutas + titulo del documento por meta
│  ├─ utils/                     # constants, validators, errorHandler, formatters, query
│  ├─ App.vue / main.js
├─ index.html
├─ vite.config.js                # Alias @ -> src, puertos 5173/4173
├─ .env.example                  # VITE_API_URL, VITE_APP_NAME
├─ Dockerfile                    # Build prod (node) + serve (nginx)
├─ docker-compose.yml
└─ README.md
```

---

## 3. Requisitos previos

- Node.js 20+ y npm 10+
- API Laravel en ejecucion (por defecto `http://localhost:8000/api`)
- (Opcional) Docker 24+ y Docker Compose v2

---

## 4. Levantar el proyecto

### 4.1 Desarrollo local

```bash
cd vue-frontend
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

### 4.2 Preview de produccion local

```bash
npm run build
npm run preview             # http://localhost:4173
```

### 4.3 Con Docker

```bash
cd vue-frontend
docker compose up -d --build
# Frontend: http://localhost:5173
docker compose logs -f
docker compose down
```

> `VITE_API_URL` es variable de compilacion de Vite: definirla antes del build.
> Ejemplo: `VITE_API_URL=http://localhost:8080/api docker compose up -d --build`.

---

## 5. Variables de entorno

| Variable | Descripcion | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API (sin `/` final) | `http://localhost:8000/api` |
| `VITE_APP_NAME` | Nombre mostrado en titulos y layout | `Overskull - Gestion de Productos` |

## 6. URLs base

| Recurso | URL (dev) |
|---|---|
| Frontend | http://localhost:5173 |
| API esperada | http://localhost:8000/api |
| API (Docker Laravel) | http://localhost:8080/api |

Rutas de la SPA: `/` (Dashboard), `/productos`, `/productos/nuevo`,
`/productos/:id/editar`, `/categorias`, `/auditoria`, `*` (404).

## 7. Consumo de la API

```js
productsService.list(filters)   // GET /products?search=&category_id=&is_active=&sort_by=&per_page=&page=
productsService.create(payload) // POST /products
productsService.update(id, p)   // PUT /products/:id
productsService.remove(id)      // DELETE /products/:id
categoriesService.options()     // GET /categories/options (selectores)
dashboardService.stats()        // GET /dashboard/stats
activityLogsService.list(f)     // GET /activity-logs?search=&log_name=&event=&per_page=&page=
```

Filtros vacios se omiten (`cleanParams`); payloads se normalizan (`toPayload`).

## 8. Comandos utiles

```bash
npm run dev        # Desarrollo con HMR
npm run build      # Compilacion a dist/
npm run preview    # Previsualizar dist/
```

---

## 2. Estructura del proyecto

