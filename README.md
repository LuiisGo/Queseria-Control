# Quesería San Antonio ERP-Lite

Sistema interno para controlar productos, ubicaciones, inventario, producción, envíos, ventas, distribuidores, créditos, mermas, reportes y cierre diario.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- API routes internas de Next.js
- Google Apps Script como backend
- Google Sheets como base de datos
- Netlify para deployment

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

## Modo demo

En `.env.local` deja:

```bash
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_APP_NAME=Quesería San Antonio
APP_SECRET=replace-with-a-long-random-secret
```

Credenciales demo:

- Admin: `admin` / `admin123`
- Tienda: `tienda` / `tienda123`

En demo mode no necesitas `APPS_SCRIPT_WEB_APP_URL`.

## Crear Google Sheet

1. Crea una hoja nueva en Google Sheets.
2. Abre `Extensiones > Apps Script`.
3. Crea los archivos `.gs` con los mismos nombres de `/apps-script`.
4. Copia el contenido de cada archivo.
5. En `Project Settings > Script Properties`, agrega:
   - `APP_SECRET`: el mismo valor que usarás en Netlify.
   - Opcional `SPREADSHEET_ID`: ID de tu Google Sheet si el script no está ligado a la hoja.
6. Ejecuta `setupSpreadsheet()` desde Apps Script.
7. Acepta permisos.

`setupSpreadsheet()` crea las 25 pestañas, headers, settings base, ubicaciones iniciales y un admin inicial `admin/admin123`. Cambia esa contraseña en cuanto conectes datos reales.

## Desplegar Apps Script

1. En Apps Script, haz clic en `Deploy > New deployment`.
2. Tipo: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Copia la Web App URL.

## Configurar producción

En Netlify agrega variables:

```bash
APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/...
APP_SECRET=un-secreto-largo-y-privado
NEXT_PUBLIC_APP_NAME=Quesería San Antonio
NEXT_PUBLIC_DEMO_MODE=false
```

El navegador nunca recibe `APP_SECRET`; todo request pasa primero por `/api/*`.

## Netlify

Este repo incluye `netlify.toml` con `@netlify/plugin-nextjs`.

Build command:

```bash
npm run build
```

Publish directory:

```bash
.next
```

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Primer uso real

1. Activa Apps Script y ejecuta `setupSpreadsheet()`.
2. Configura `.env.local` o Netlify con `NEXT_PUBLIC_DEMO_MODE=false`.
3. Entra con `admin/admin123`.
4. Crea ubicaciones reales.
5. Crea productos.
6. Crea usuarios tienda, asigna ubicaciones y permisos.
7. Cambia la contraseña inicial del admin.

## Alcance MVP

El MVP incluye flujos principales funcionales, validaciones en backend, auditoría y modelo de hojas listo para operación. En demo, las imágenes de producto se suben desde galería/cámara/archivos y se guardan localmente como datos de imagen para mostrar la vista previa.
