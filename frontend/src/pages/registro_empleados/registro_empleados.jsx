import { useState, useEffect } from "react";
import api from "../../services/api"; // Tu servicio Axios configurado
import "./registro_empleados.css"; // Extensión .css integrada para evitar fallos en Vite

function RegistroEmpleados() {
  // Estados para la lista de empleados y control de edición
  const [empleados, setEmpleados] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  // Estados del formulario unificado (incluyendo teléfono y es_admin)
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);

  // Estados de notificaciones
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // 1. LEER: Cargar la lista de empleados desde Django (Incluye token JWT)
  const cargarEmpleados = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await api.get("empleados/listar/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmpleados(response.data);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
      setError("No se pudo obtener la lista de empleados.");
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // 2. CREAR O EDITAR: Envío unificado al backend (Incluye token JWT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const payload = {
      username,
      email,
      password,
      telefono,
      es_admin: esAdmin,
    };

    const token = localStorage.getItem("access");

    try {
      if (editandoId) {
        // MODO EDICIÓN (PUT): empleados/<id>/actualizar/
        if (!password) delete payload.password;

        const response = await api.put(
          `empleados/${editandoId}/actualizar/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setMensaje(response.data.mensaje || "Empleado actualizado con éxito.");
      } else {
        // MODO CREACIÓN (POST): registro/
        const response = await api.post("registro/", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMensaje(response.data.mensaje || "Empleado registrado con éxito.");
      }

      limpiarFormulario();
      cargarEmpleados(); // Recargar la tabla automáticamente
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Error al procesar la solicitud. Verifica los campos.",
      );
    }
  };

  // Cargar datos en el formulario para editar
  const iniciarEdicion = (empleado) => {
    setEditandoId(empleado.id);
    setUsername(empleado.username);
    setEmail(empleado.email || "");
    setPassword(""); // Se deja vacío por seguridad
    setTelefono(empleado.telefono || "");
    setEsAdmin(empleado.es_admin || false);
  };

  // 3. CAMBIO DE ESTADO (PATCH): Alta o Baja lógica (is_active) (Incluye token JWT)
  const toggleEstado = async (id, estadoActual, nombre) => {
    const accionTexto = estadoActual ? "desactivar" : "activar";
    if (
      window.confirm(`¿Seguro que deseas ${accionTexto} al empleado ${nombre}?`)
    ) {
      try {
        setMensaje("");
        setError("");
        const token = localStorage.getItem("access");

        await api.patch(
          `empleados/${id}/estado/`,
          { is_active: !estadoActual },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setMensaje(`Usuario ${nombre} modificado correctamente.`);
        cargarEmpleados();
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Error al cambiar el estado.");
      }
    }
  };

  // 💥 4. ELIMINACIÓN PERMANENTE (DELETE): Borra el registro físico en Django
  const handleEliminarParaSiempre = async (id, nombre) => {
    const confirmacion = window.confirm(
      `⚠️ ADVERTENCIA CRÍTICA: ¿Estás seguro de que deseas eliminar para siempre al empleado "${nombre}"?\n\nEsta acción NO se puede deshacer y borrará todo su historial.`,
    );

    if (confirmacion) {
      try {
        setMensaje("");
        setError("");
        const token = localStorage.getItem("access");

        const response = await api.delete(`empleados/${id}/eliminar/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMensaje(response.data.mensaje);
        cargarEmpleados(); // Refrescar la tabla inmediatamente
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error ||
            "Error al intentar eliminar permanentemente al usuario.",
        );
      }
    }
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setTelefono("");
    setEsAdmin(false);
  };

  return (
    <div className="registro-empleados-container">
      <h2>Gestión de Personal - Panel de Control del Dueño</h2>

      {mensaje && <p className="success-message">{mensaje}</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Formulario Dinámico */}
      <div className="form-section">
        <h3>
          {editandoId
            ? "📝 Modificar Trabajador"
            : "➕ Registrar Nuevo Trabajador"}
        </h3>
        <form onSubmit={handleSubmit} className="registro-form">
          <div className="form-group">
            <label>Nombre de Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ej: juan_cajero"
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@correo.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editandoId}
              placeholder={
                editandoId
                  ? "Dejar en blanco para mantener la actual"
                  : "••••••••"
              }
            />
          </div>

          <div className="form-group">
            <label>Teléfono de Contacto</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 5512345678"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={esAdmin}
                onChange={(e) => setEsAdmin(e.target.checked)}
              />
              ¿Asignar privilegios de Administrador (Dueño)?
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-registrar">
              {editandoId ? "Guardar Cambios" : "Dar de Alta en el Sistema"}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="btn-cancelar"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de Gestión del CRUD */}
      <div className="tabla-section" style={{ marginTop: "40px" }}>
        <h3>Trabajadores Registrados</h3>
        <table
          className="tabla-empleados"
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th>Usuario</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No hay empleados registrados.
                </td>
              </tr>
            ) : (
              empleados.map((emp) => (
                <tr key={emp.id} style={{ opacity: emp.is_active ? 1 : 0.6 }}>
                  <td>
                    <strong>{emp.username}</strong>
                  </td>
                  <td>{emp.email || "N/A"}</td>
                  <td>{emp.telefono || "N/A"}</td>
                  <td>{emp.es_admin ? "Admin" : "Empleado"}</td>
                  <td>{emp.is_active ? "🟢 Activo" : "🔴 Inactivo"}</td>
                  <td>
                    <button
                      onClick={() => iniciarEdicion(emp)}
                      className="btn-editar"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        toggleEstado(emp.id, emp.is_active, emp.username)
                      }
                      className={
                        emp.is_active ? "btn-baja-rojo" : "btn-activar-verde"
                      }
                    >
                      {emp.is_active ? "Dar de Baja" : "Activar"}
                    </button>

                    <button
                      onClick={() =>
                        handleEliminarParaSiempre(emp.id, emp.username)
                      }
                      className="btn-eliminar-definitivo"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RegistroEmpleados;
