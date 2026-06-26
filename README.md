# Paraiso Biker — Frontend

Panel de administración web para **Paraiso Biker**, un sistema de inventario y
ventas para una tienda de motocicletas y bicicletas. Construido con React 19,
TypeScript y Tailwind CSS v4.

## Visión General

Este frontend consume la API REST de Paraiso Biker (FastAPI) y expone módulos
para gestión de products, inventario, ventas, clientes, categorías y
proveedores, además de autenticación basada en JWT y un panel de dashboard.

### Stack Técnico

- **React 19** + **TypeScript** (~5.7)
- **Tailwind CSS v4** (configuración vía `@theme` en `src/index.css`)
- **Vite 6** como bundler y dev server
- **React Router 7** para el enrutamiento
- **Axios** para la capa de servicios / API
- **ApexCharts** + **FullCalendar** + **Swiper** para visualización

## Estructura del Proyecto

```
src/
├── components/     # Componentes UI reutilizables (auth, common, charts, form, tables, ui)
├── context/        # React contexts (Auth, Theme, Sidebar, Toast)
├── hooks/          # Custom hooks
├── icons/          # Íconos SVG importados como componentes React
├── layout/         # AppLayout, AppSidebar, AppHeader, SidebarWidget
├── pages/          # Componentes de página por ruta
├── services/       # Capa de servicios (api.ts base + servicios por dominio)
├── types/          # Definiciones de tipos TypeScript
├── App.tsx         # Definición de rutas
├── index.css       # Config Tailwind v4 (@theme) + estilos globales
└── main.tsx        # Entry point (providers: Theme, Auth, Toast)
```

## Comenzando

### Prerrequisitos

- Node.js 18.x o superior (recomendado 20.x+)
- Backend de Paraiso Biker corriendo en `http://localhost:8000`

### Instalación

```bash
npm install
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del frontend (ver `.env.example`):

```
VITE_API_URL=http://localhost:8000/api
```

> `.env` está gitignorado. El servicio `api.ts` usa
> `http://localhost:8000/api` como fallback si la variable no está definida.
> El backend debe incluir `http://localhost:5173` en su CORS.

### Scripts

```bash
npm run dev        # Dev server (http://localhost:5173)
npm run build      # tsc -b && vite build (typecheck + build)
npm run lint       # ESLint
npm run preview    # Preview del build de producción
```

No hay runner de tests configurado. No hay formatter (prettier) configurado.

> **Nota:** TypeScript está en modo estricto con `noUnusedLocals` y
> `noUnusedParameters` — las variables sin usar fallarán el build.

## Autenticación

- Manejada via `AuthProvider` en `src/context/AuthContext.tsx`.
- Token JWT guardado en `localStorage` bajo la clave `token`.
- `src/components/auth/ProtectedRoute.tsx` protege las rutas del dashboard.
- El interceptor en `src/services/api.ts` adjunta `Authorization: Bearer <token>`
  a cada request y, ante un 401, limpia el token y redirige a `/signin`.

## Sistema de Íconos SVG

Los íconos viven en `src/icons/` como archivos `.svg` y se importan como
componentes React usando el plugin svgr de Vite con el sufijo `?react`:

```tsx
import { ReactComponent as MyIcon } from "./my-icon.svg?react";
```

Se re-exportan desde `src/icons/index.ts`. Al agregar íconos: usa `fill="currentColor"`,
`viewBox="0 0 24 24"`, `fill-rule="evenodd"`. Las declaraciones de tipos están en
`src/svg.d.ts`.

## Tailwind v4

Este proyecto usa **Tailwind CSS v4** (no v3). Diferencias clave:

- La configuración vive en `src/index.css` vía bloque `@theme`, no en `tailwind.config.js`.
- Se usa `@import "tailwindcss"` en lugar de directivas `@tailwind`.
- Las utilidades custom usan la directiva `@utility` (no `@layer components`).
- El plugin PostCSS es `@tailwindcss/postcss`.

Los colores de marca son los tokens `--color-brand-*` en el bloque `@theme`.

### Colores de Marca

- `#fc5c06` — naranja
- `#2a2f29` — oscuro
- `#fffff3` — crema

## Convences

- **Idioma:** Español para textos de UI; inglés para código.
- Reemplazar cualquier referencia residual "TailAdmin" en los meta tags de las
  páginas con "Paraiso Biker".

## Atribuciones

Basado en [TailAdmin React](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard),
distribuido bajo la Licencia MIT (ver `LICENSE.md`).

## Licencia

El código original de TailAdmin React está licenciado bajo MIT — ver
[`LICENSE.md`](./LICENSE.md) para el texto completo de la licencia y el aviso de
copyright de los autores originales. Las modificaciones para Paraiso Biker se
distribuyen bajo los mismos términos.