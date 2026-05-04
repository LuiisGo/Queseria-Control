# Seguridad

## Implementado en MVP

- `APP_SECRET` se usa solo del lado servidor.
- El frontend nunca llama Apps Script directamente.
- Todas las llamadas pasan por `/api/*`.
- Apps Script valida `APP_SECRET` antes de ejecutar acciones.
- Apps Script valida usuario activo, rol, permisos y ubicación asignada.
- Tienda no puede entrar a `/admin`.
- Los precios se resuelven desde tablas oficiales.
- Ventas y mermas validan stock disponible salvo que `allow_negative_stock=true`.
- Acciones importantes escriben en `Audit_Log`.
- Cookie de sesión HTTP-only firmada con HMAC.

## Limitaciones del MVP

- Google Sheets no tiene transacciones reales; operaciones simultáneas intensas pueden requerir LockService y una cola más robusta.
- Password hashing usa SHA-256 con salt por compatibilidad con Apps Script. Es aceptable para demo/MVP interno, pero no equivale a bcrypt/argon2.
- Las sesiones son simples y duran 24 horas.
- IP/User Agent quedan opcionales porque Apps Script Web App no siempre expone esos datos de forma confiable.
- La carga real de imágenes a Drive no está incluida; productos usan URL/placeholder.

## Mejoras futuras

- Hash fuerte de contraseñas con backend dedicado.
- JWT/sesiones con refresh tokens o proveedor de auth interno.
- Backups automáticos versionados de Sheets.
- LockService en cada operación crítica de inventario.
- Migración a Postgres/Supabase si el volumen supera Google Sheets.
- Auditoría con IP/User Agent desde middleware Next.js.
