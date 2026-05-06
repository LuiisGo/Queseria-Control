# Apps Script Backend

Este folder contiene el backend que debe copiarse a un proyecto de Google Apps Script ligado a una Google Spreadsheet.

## Archivos

- `Code.gs`: endpoint principal `doPost(e)` y dispatcher.
- `Config.gs`: configuración y schema de pestañas.
- `Setup.gs`: crea pestañas, headers y datos iniciales.
- `Auth.gs`: login y hash SHA-256 con salt.
- `Users.gs`, `Branches.gs`, `Products.gs`, `Prices.gs`: catálogos y precios.
- `Inventory.gs`, `Production.gs`, `Transfers.gs`, `Sales.gs`, `Waste.gs`: movimientos operativos.
- `Distributors.gs`, `Credits.gs`: mayoristas y cuentas por cobrar.
- `Reports.gs`: dashboards y exportación.
- `Notifications.gs`: notificaciones in-app y correo.
- `Corrections.gs`, `DailyClosings.gs`, `Audit.gs`, `Utils.gs`: soporte operativo.

## Script Properties

Configura:

- `APP_SECRET`: requerido; debe coincidir con `APP_SECRET` en Next.js/Netlify.
- `SPREADSHEET_ID`: opcional si el Apps Script no está ligado directamente a la hoja.

## Setup

1. Copia todos los `.gs`.
2. Guarda el proyecto.
3. En Project Settings > Script Properties define `APP_SECRET`, `SPREADSHEET_ID`, `INITIAL_ADMIN_PASSWORD`, `INITIAL_CENTRAL_PASSWORD` e `INITIAL_AGROMARKET_PASSWORD`.
4. Ejecuta `setupSpreadsheet()`.
5. Autoriza permisos.
6. Despliega como Web App.

`setupSpreadsheet()` es seguro e idempotente: crea pestañas, agrega headers faltantes y siembra datos base solo cuando no existen. No borra registros reales. Para reiniciar una hoja existe la acción separada `RESET_SPREADSHEET_DANGEROUSLY`, que exige usuario Admin, confirmación exacta `BORRAR TODO` y valida las contraseñas iniciales antes de borrar.

El setup inicial crea `Central`, `Agromarket 1`, productos SKU `QG260504` a `CB260504`, distribuidores `Mazate` y `CAES`, y usuarios iniciales `admin`, `tienda` y `agromarket1` usando las contraseñas guardadas en Script Properties.

Formato de códigos:

- Productos/SKU: código de producto + fecha `YYMMDD`, por ejemplo `QG260504`; si se repite, `QG26050402`.
- Ubicaciones: `AGM001`, `AGM002`.
- Distribuidores: `ALIS001`, `ALIS002`.

## Request

```json
{
  "secret": "APP_SECRET",
  "action": "LIST_PRODUCTS",
  "payload": {}
}
```

## Response

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

Errores:

```json
{
  "success": false,
  "error": "Mensaje claro"
}
```

## Seguridad MVP

Apps Script valida `APP_SECRET`, usuario activo, rol, permisos, sucursal asignada, stock, lotes FIFO y precios oficiales. Las contraseñas usan SHA-256 con salt por limitaciones del entorno; para una versión más fuerte, migrar a un proveedor de auth o un backend con bcrypt/argon2.

Las imágenes subidas se guardan como `Image_Data` en Sheets para MVP. Para operación con muchas imágenes, moverlas a Google Drive y guardar solo URL.

Producción usa la fecha del sistema como fecha de producción y calcula vencimiento automáticamente 16 días después. Las notificaciones de vencimiento se crean cuando faltan 2 días o menos. Ejecuta `installDailyNotificationTrigger()` una vez si quieres revisión diaria automática.
