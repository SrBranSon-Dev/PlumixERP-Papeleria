## 🚀 Guía de Trabajo Diario (Flujo Manual y Seguro)

Sigue estos pasos en orden cada vez que vayas a trabajar en el proyecto para mantener el código actualizado y libre de errores.

---

### ☀️ 1. Al Empezar el Día (Actualizar)

Antes de modificar cualquier archivo, asegúrate de tener la última versión del código que está en la nube:

1. Abre la terminal en la **carpeta raíz** del proyecto.
2. Descarga los últimos cambios de la rama de desarrollo:
   ```bash
   git pull origin develop
   ```
3. Instala/actualiza las dependencias del **Backend (Django)**:
   ```bash
   cd backend
   # Activa tu entorno virtual aquí si lo utilizas
   pip install -r requirements.txt
   cd ..
   ```
4. Instala las dependencias del **Frontend (React)**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

### 💻 2. Mientras Programas

* Abre dos pestañas en tu terminal (una para `backend` y otra para `frontend`) para ejecutar tus servidores en paralelo.
* Realiza pruebas locales en el navegador antes de guardar.

---

### 🌙 3. Al Terminar la Sesión (Subir Cambios)

Cuando tu código esté listo, sin errores y quieras respaldarlo en GitHub, ejecuta estos comandos en la **carpeta raíz**:

1. Revisa qué archivos modificaste:
   ```bash
   git status
   ```
2. Agrega todos los cambios al área de preparación:
   ```bash
   git add .
   ```
3. Guarda tu avance localmente con un mensaje descriptivo:
   ```bash
   git commit -m "Escribe aquí lo que hiciste (ej: Agregado módulo de gestión de usuarios)"
   ```
4. Sube tus cambios a la rama correcta en GitHub:
   ```bash
   git push origin develop
   ```

---

## 🛠️ Cómo Iniciar los Servidores de Desarrollo

Para probar la aplicación localmente, debes encender tanto el servidor del Backend (Django) como el del Frontend (Vite/React) al mismo tiempo.

### 🖥️ Terminal 1: Servidor Backend (Django)
Abre una terminal en la carpeta raíz del proyecto, entra a la carpeta del backend y arranca el servidor de Python:
```bash
cd backend/proyecto/
python manage.py runserver
```
*Nota: Si utilizas un entorno virtual (venv), asegúrate de activarlo antes (`source venv/bin/activate` en Mac/Linux o `.\venv\Scripts\activate` en Windows).*

### 🎨 Terminal 2: Servidor Frontend (React)
Abre una segunda pestaña o ventana de la terminal en la carpeta raíz del proyecto, entra a la carpeta del frontend y arranca React:
```bash
cd frontend
npm run dev
```

Una vez que ambas terminales estén corriendo, abre tu navegador en la dirección local que te indique la Terminal 2 (normalmente `http://localhost:5173`).

---

## 👥 Módulo de Gestión de Usuarios y Seguridad

Este módulo administra de forma centralizada el control de accesos, el login mediante tokens criptográficos y las acciones administrativas del personal utilizando una arquitectura desacoplada.

#### 🔒 Mecanismos de Protección y Blindaje
* **Autenticación Asíncrona JWT:** Las credenciales se validan contra el backend de Django, generando tokens de acceso y refresco de corta duración persistidos en el cliente (`localStorage`).
* **Seguridad en Frontend (React):** Rutas restringidas dinámicamente mediante el componente de orden superior `<ProtectedRoute />`. Si un usuario con rango de `Empleado` intenta inyectar manualmente la URL `/admin/*` en el explorador, el validador limpia la pila de navegación y lo rebota al Dashboard de forma inmediata.
* **Seguridad en Backend (Django):** Los endpoints críticos se encuentran encapsulados bajo permisos de clase (`EsAdministrador`). Aunque un cliente intente interceptar o saltarse la interfaz gráfica, la API REST rechaza la petición a nivel de servidor si el token no tiene propiedades de administrador (`is_superuser=True`).
* **Cifrado de Credenciales:** Las contraseñas se almacenan mediante el algoritmo nativo de hash criptográfico `pbkdf2_sha256` de Django. Este cifrado se aplica automáticamente tanto en altas como en modificaciones de cuentas.
* **Trazabilidad de Acciones (Auditoría):** Conexión directa con la tabla `AuditoriaLog`. Cada evento del CRUD (alta, edición, baja lógica o eliminación permanente) genera un log automático en el servidor con el timestamp, descripción de la acción, usuario responsable y dirección IP.

#### 🛠️ Configuración Inicial de Base de Datos (Obligatorio para el Equipo)
Para que el sistema de asignación de roles asocie correctamente los permisos sin arrojar excepciones en el servidor al crear trabajadores, todos los integrantes del equipo deben poblar sus bases de datos locales corriendo los siguientes comandos:

1. **Construir y aplicar esquemas de tablas:**
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

Al momento de crearlo, utiliza los siguientes accesos estándar de prueba para que todo el equipo mantenga la misma configuración:

* **Usuario:** `admin`
* **Contraseña:** `Admin123456789`

> ⚠️ **Importante:** Estas credenciales están destinadas exclusivamente para el uso del equipo de desarrollo en entornos locales. Nunca utilices estas contraseñas en servidores de producción.
