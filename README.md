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
3. Instala las dependencias del **Backend**:
   ```bash
   cd backend
   npm install
   cd ..
   ```
4. Instala las dependencias del **Frontend**:
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
   git commit -m "Escribe aquí lo que hiciste (ej: Agregado manejo de errores en LoginCard)"
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
cd backend
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


## 🔐 Credenciales de Desarrollo (Dev)

Para realizar pruebas de inicio de sesión en el entorno local, utiliza los siguientes accesos:

* **Usuario:** `admin`
* **Contraseña:** `123456789`

> ⚠️ **Importante:** Estas credenciales están destinadas exclusivamente para el uso del equipo de desarrollo en entornos locales. Nunca utilices estas contraseñas en servidores de producción.
