# PlumixERP Papeleria

## 1. Proposito

PlumixERP es un ERP para una papeleria. El sistema administra autenticacion, personal, proveedores, productos, inventario, clientes, compras, ventas, facturacion, reportes y auditoria.

La aplicacion esta dividida en:

- `backend/`: API REST desarrollada con Django y Django REST Framework.
- `frontend/`: interfaz SPA desarrollada con React y Vite.
- `docs/`: documentacion tecnica y de operacion.

## 2. Arquitectura

### Backend

El backend utiliza una aplicacion Django por dominio:

| App           | Responsabilidad                                           |
| ------------- | --------------------------------------------------------- |
| `usuarios`    | Usuario personalizado, roles, permisos, auditoria y caja. |
| `proveedores` | Proveedores de la papeleria.                              |
| `productos`   | Categorias, productos e inventario.                       |
| `clientes`    | Clientes y sus datos de contacto.                         |
| `compras`     | Entradas de inventario y compras a proveedores.           |
| `ventas`      | Ventas, detalles y salida de inventario.                  |
| `facturacion` | Facturas, resoluciones, impuestos y eventos DIAN.         |
| `reportes`    | Consultas agregadas para el panel de reportes.            |

`backend/proyecto/core/urls.py` concentra el registro de las rutas publicas de cada API. La API usa JWT y exige autenticacion por defecto, salvo los endpoints de login y refresh.

### Frontend

`frontend/src/App.jsx` define las rutas de la SPA. `ProtectedRoute` controla autenticacion y roles. `services/api.jsx` configura Axios, agrega el token Bearer y redirige al login ante un `401`.

Cada pantalla mantiene sus estilos en un archivo CSS local. Las variables de color, tipografia, bordes y sombras viven en `frontend/src/index.css`.

## 3. Arranque local

### Backend

Desde la raiz:

```bash
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
cd proyecto
python manage.py migrate
python manage.py runserver
```

Si el entorno usa `python3`, sustituye `python` por `python3`.

### Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La interfaz suele estar disponible en `http://localhost:5173` y la API en `http://127.0.0.1:8000`.

## 4. Comandos de validacion

```bash
cd frontend
npm run lint
npm run build
```

```bash
cd backend/proyecto
python manage.py check
python manage.py test
```

Antes de abrir una pull request, ejecuta ambos grupos de comandos.

## 5. Rutas principales

| Ruta frontend      | Modulo                                    |
| ------------------ | ----------------------------------------- |
| `/dashboard`       | Panel principal.                          |
| `/proveedores`     | Proveedores.                              |
| `/productos`       | Productos e inventario.                   |
| `/clientes`        | Clientes.                                 |
| `/compras`         | Registro e historial de compras.          |
| `/ventas`          | Registro e historial de ventas.           |
| `/facturacion`     | Emision e historial de facturas.          |
| `/reportes`        | Reportes de ventas.                       |
| `/admin/registro`  | Gestion de empleados, solo administrador. |
| `/admin/auditoria` | Logs de auditoria, solo administrador.    |

## 6. Endpoints de dominio

- `api/login/` y `api/refresh/`: autenticacion JWT.
- `api/proveedores/`: proveedores.
- `api/clientes/`: clientes.
- `api/productos/api/productos/`: productos.
- `api/productos/api/categorias/`: categorias.
- `api/ventas/ventas/`: ventas.
- `api/ventas/detalles-venta/`: detalles de venta.
- `api/compras/compras/`: compras.
- `api/compras/detalles-compra/`: detalles de compra.
- `api/facturacion/resoluciones/`: resoluciones de facturacion.
- `api/facturacion/facturas/`: facturas electronicas.
- `api/facturacion/detalles/`: detalles de factura.
- `api/facturacion/impuestos/`: impuestos.
- `api/facturacion/eventos-dian/`: eventos recibidos de la DIAN.

## 7. Flujos de datos

### Compra

1. El frontend crea una compra con un proveedor.
2. Cada detalle valida cantidad y precio.
3. El detalle aumenta el inventario dentro de una transaccion.
4. La compra recalcula su total.
5. Al eliminar un detalle, el inventario se revierte y el total se recalcula.

### Venta

1. El frontend crea la venta con cliente y medio de pago.
2. Cada detalle valida el inventario disponible.
3. El detalle descuenta inventario y actualiza subtotal, IVA y total.
4. Al eliminar un detalle, el inventario se devuelve.

### Facturacion

1. El usuario selecciona una venta que aun no tenga factura.
2. El frontend solicita una resolucion activa.
3. El serializer reserva el siguiente consecutivo con bloqueo transaccional.
4. Se crea la factura vinculada a la venta y al cliente.
5. Se copian los detalles de venta y se calculan sus impuestos y totales.
6. Los campos XML, CUFE, QR y respuesta DIAN estan preparados para una integracion posterior.

## 8. Convenciones visuales

- Las variables globales de color y espaciado se definen en `frontend/src/index.css`.
- Los estilos de una pantalla deben estar prefijados por el contenedor de esa pantalla para evitar colisiones.
- Los contenedores de contenido usan `--content-width`.
- Las superficies usan `--color-surface`, `--color-border` y `--shadow-card`.
- Los botones y controles deben conservar estados `:hover`, `:focus` y `:disabled`.
- Las tablas deben envolverse en un contenedor con scroll horizontal en pantallas pequenas.
- Se respeta `prefers-reduced-motion` para personas que reducen animaciones.

## 9. Seguridad y datos sensibles

- No commits secretos, contrasenas, tokens ni archivos `.env`.
- Cambia las credenciales de desarrollo antes de desplegar.
- Mantiene `DEBUG=False` y una lista explicita de hosts en produccion.
- Los permisos del frontend no sustituyen los permisos del backend.
- Los endpoints protegidos deben validarse siempre en Django.

## 10. Estado conocido

La estructura de facturacion almacena XML, CUFE, QR y respuestas DIAN, pero la conexion con un proveedor tecnologico o con los servicios de la DIAN aun debe implementarse por separado. La documentacion describe el contrato actual sin afirmar que el envio electronico ya exista.
