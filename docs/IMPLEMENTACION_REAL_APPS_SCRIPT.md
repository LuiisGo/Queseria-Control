# Guía de implementación real con Google Sheets y Apps Script

Esta guía conecta la app de Quesería San Antonio con Google Sheets usando Apps Script. Mientras `NEXT_PUBLIC_DEMO_MODE=true`, la app usa datos mock; para operación real hay que desplegar Apps Script y cambiar demo mode a `false`.

## 1. Preparar el proyecto local

```bash
cd /Users/luismarroquin/Queseria-Control-ERP
npm install
cp .env.example .env.local
```

Para seguir en demo:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

Para conectar Sheets:

```bash
NEXT_PUBLIC_DEMO_MODE=false
```

## 2. Crear el Google Sheet

1. Entra a Google Sheets.
2. Crea una hoja nueva.
3. Ponle nombre: `Queseria San Antonio ERP`.
4. Copia el ID del Sheet desde la URL:

```txt
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

## 3. Abrir Apps Script

1. Dentro del Sheet, ve a `Extensiones > Apps Script`.
2. Renombra el proyecto a `Queseria San Antonio Backend`.
3. Crea un archivo `.gs` por cada archivo dentro de `/apps-script`.
4. Copia el contenido de cada archivo del repo al archivo correspondiente en Apps Script.

Archivos obligatorios:

```txt
Code.gs
Config.gs
Auth.gs
Users.gs
Branches.gs
Products.gs
Prices.gs
Inventory.gs
Production.gs
Transfers.gs
Sales.gs
Distributors.gs
Credits.gs
Reports.gs
Notifications.gs
Audit.gs
Setup.gs
Utils.gs
Corrections.gs
DailyClosings.gs
Waste.gs
```

## 4. Configurar Script Properties

En Apps Script:

1. Ve a `Project Settings`.
2. Busca `Script Properties`.
3. Agrega:

```txt
APP_SECRET = un-secreto-largo-y-privado
SPREADSHEET_ID = el-id-de-tu-google-sheet
```

`APP_SECRET` debe ser exactamente igual al que pondrás en `.env.local` y Netlify.

## 5. Crear estructura de Sheets

En Apps Script:

1. Abre `Setup.gs`.
2. En el selector de funciones, elige `setupSpreadsheet`.
3. Haz clic en `Run`.
4. Acepta permisos.

Importante: `setupSpreadsheet()` es seguro e idempotente. Puedes ejecutarlo para crear pestañas o headers faltantes; no borra registros reales. Si alguna vez necesitas reiniciar todo, usa únicamente la acción `RESET_SPREADSHEET_DANGEROUSLY` con confirmación exacta `BORRAR TODO`.

El setup crea:

- Las 25 pestañas.
- Headers correctos.
- Settings base.
- Ubicaciones iniciales: `AGM001 Central`, `AGM002 Agromarket 1`.
- Productos iniciales con SKU `QG260504` a `CB260504`.
- Distribuidores `ALIS001 Mazate`, `ALIS002 CAES`.
- Usuarios iniciales: `admin`, `tienda` y `agromarket1`.
- Contraseñas iniciales: se leen desde `INITIAL_ADMIN_PASSWORD`, `INITIAL_CENTRAL_PASSWORD` e `INITIAL_AGROMARKET_PASSWORD` en Script Properties.

Formato de IDs:

- Producto/SKU: código del producto + fecha de producción `YYMMDD`, de 8 a 12 caracteres. Ejemplo: `QG260504`.
- Si se crea otro SKU del mismo producto en la misma fecha, se agrega secuencia: `QG26050402`.
- Ubicaciones: `AGM001`, `AGM002`, `AGM003`.
- Distribuidores: `ALIS001`, `ALIS002`, `ALIS003`.

## 6. Desplegar Apps Script como Web App

1. En Apps Script, clic en `Deploy > New deployment`.
2. Tipo: `Web app`.
3. Description: `Producción inicial`.
4. Execute as: `Me`.
5. Who has access: `Anyone`.
6. Clic en `Deploy`.
7. Copia la `Web App URL`.

La URL se ve similar a:

```txt
https://script.google.com/macros/s/AKfycb.../exec
```

## 7. Configurar `.env.local`

En tu máquina:

```bash
cd /Users/luismarroquin/Queseria-Control-ERP
```

Edita `.env.local`:

```bash
APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/AKfycb.../exec
APP_SECRET=el-mismo-secreto-de-apps-script
NEXT_PUBLIC_APP_NAME=Quesería San Antonio
NEXT_PUBLIC_DEMO_MODE=false
```

Luego corre:

```bash
npm run dev
```

Abre:

```txt
http://localhost:3000
```

## 8. Primer login real

Usa el usuario `admin` con la contraseña definida en `INITIAL_ADMIN_PASSWORD`.

Después:

1. Entra a `Usuarios`.
2. Crea un nuevo Admin con contraseña nueva.
3. Desactiva o cambia la contraseña del admin inicial.
4. Crea usuarios de tienda.
5. Asigna ubicaciones y permisos.

## 9. Flujo operativo recomendado

1. `Productos`: revisa SKU, nombres, imágenes y precios.
2. `Usuarios`: crea usuarios por ubicación.
3. `Operar > Registrar producción`: entra inventario a Central con lote. El sistema usa la fecha del día como fecha de producción y calcula vencimiento automático 16 días después.
4. `Operar > Enviar a tienda`: mueve inventario de Central a sucursal.
5. `Tienda > Venta`: descuenta inventario por FIFO.
6. `Operar > Venta a distribuidor`: registra ventas a Mazate/CAES; si es crédito, crea cuenta por cobrar.
7. `Créditos`: registra abonos.
8. `Inventario`: revisa stock, lotes y alertas de vencimiento.

## 10. Deploy en Netlify

En Netlify:

1. Conecta el repo `LuiisGo/Queseria-Control`.
2. Build command:

```bash
npm run build
```

3. Publish directory:

```txt
.next
```

4. Variables de entorno:

```bash
APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/AKfycb.../exec
APP_SECRET=el-mismo-secreto-de-apps-script
NEXT_PUBLIC_APP_NAME=Quesería San Antonio
NEXT_PUBLIC_DEMO_MODE=false
```

5. Deploy.

## 11. Notas importantes

- No expongas `APP_SECRET` como `NEXT_PUBLIC`.
- El frontend nunca llama Apps Script directo; siempre pasa por `/api`.
- Apps Script valida secreto, usuario activo, permisos, sucursal asignada, stock y precios.
- Las imágenes subidas se guardan como `Image_Data` en Sheets para MVP. Para producción con muchas imágenes, conviene migrarlas a Google Drive y guardar solo el enlace.
- Los movimientos de salida usan FIFO por vencimiento de lote.
- Las notificaciones de vencimiento se crean cuando faltan 2 días o menos para el vencimiento del lote.
- Para revisión automática diaria, en Apps Script ejecuta una vez `installDailyNotificationTrigger()`. Esto instala un trigger diario a las 7:00 para revisar vencimientos.
- `setupSpreadsheet()` no borra datos; solo crea estructura faltante y datos base si no existen.
- El reinicio total quedó separado en `RESET_SPREADSHEET_DANGEROUSLY` para evitar borrados accidentales.
