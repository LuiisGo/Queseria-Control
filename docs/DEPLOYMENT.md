# Deployment

## Local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Apps Script

1. Crear Google Sheet.
2. Abrir Apps Script desde la hoja.
3. Copiar archivos de `/apps-script`.
4. Configurar Script Properties:
   - `APP_SECRET`
   - opcional `SPREADSHEET_ID`
5. Ejecutar `setupSpreadsheet()`.
6. Deploy como Web App.
7. Copiar Web App URL.

## Netlify

1. Conectar repo `luiisgo/queseria-control`.
2. Build command: `npm run build`.
3. Publish directory: `.next`.
4. Variables:
   - `APPS_SCRIPT_WEB_APP_URL`
   - `APP_SECRET`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_DEMO_MODE=false`

## Desactivar demo

Cambia:

```bash
NEXT_PUBLIC_DEMO_MODE=false
```

Vuelve a desplegar.
