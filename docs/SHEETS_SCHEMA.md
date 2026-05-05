# Google Sheets Schema

Una sola Spreadsheet con pestañas por módulo.

| Pestaña | Propósito |
| --- | --- |
| `Settings` | Configuración general, emails admin y flags de notificación. |
| `Users` | Usuarios, rol, estado y hash de contraseña. |
| `User_Branches` | Relación usuario-ubicación. |
| `Permissions` | Permisos configurables por usuario tienda. |
| `Branches` | Producción, tienda central y sucursales. |
| `Products` | Catálogo de productos/presentaciones. |
| `Product_Prices` | Precios oficiales globales y especiales. |
| `Price_History` | Historial de cambios de precio. |
| `Distributors` | Mayoristas/distribuidores. |
| `Inventory` | Stock agregado por producto y ubicación. |
| `Inventory_Lots` | Lotes, vencimientos y cantidades. |
| `Production` | Producto terminado registrado. |
| `Transfers` | Envíos entre tienda central y sucursales. |
| `Transfer_Items` | Productos de cada envío. |
| `Sales` | Encabezado de ventas. |
| `Sale_Items` | Productos vendidos. |
| `Credits` | Cuentas por cobrar. |
| `Credit_Payments` | Abonos a créditos. |
| `Waste` | Pérdidas. |
| `Returns` | Devoluciones. |
| `Stock_Adjustments` | Ajustes manuales Admin. |
| `Correction_Requests` | Solicitudes de corrección. |
| `Daily_Closings` | Cierre diario por ubicación. |
| `Notifications` | Notificaciones internas y email. |
| `Audit_Log` | Auditoría de acciones importantes. |

## IDs

- Users: `USR001`
- Branches: `BR001`
- Products: `LSA001`
- Sales: `SALE001`
- Transfers: `TRF001`
- Production: `PROD001`
- Distributors: `DIST001`
- Credits: `CRD001`

Los headers exactos viven en `apps-script/Config.gs` y se crean automáticamente con `setupSpreadsheet()`. `Products` incluye `Image_Data` para imagen subida en MVP y `Image_Url` para migración futura a Drive.
