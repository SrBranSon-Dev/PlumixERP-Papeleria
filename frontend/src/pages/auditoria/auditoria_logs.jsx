import { useState, useEffect } from "react";
import api from "../../services/api"; // Tu servicio Axios configurado
import "./auditoria_logs.css"; // Estilos opcionales para tu tabla

function AuditoriaLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerLogs = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await api.get("auditoria/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLogs(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(
          "No se pudo cargar el historial de auditoría o no tienes permisos.",
        );
        setLoading(false);
      }
    };

    obtenerLogs();
  }, []);

  if (loading)
    return <div className="loading">Cargando historial de seguridad...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="auditoria-container">
      <h2>Historial de Auditoría y Seguridad (Logs)</h2>
      <p className="subtitulo">
        Registro inalterable de las acciones realizadas por el personal.
      </p>

      <div className="table-responsive">
        <table className="auditoria-tabla">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Usuario / Empleado</th>
              <th>Acción</th>
              <th>Descripción</th>
              <th>Dirección IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No hay registros de acciones todavía.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="fecha-col">
                    {new Date(log.fecha_hora).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="usuario-col">
                    <strong>{log.usuario_nombre || "Sistema / Anónimo"}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge accion-${log.accion.toLowerCase()}`}
                    >
                      {log.accion}
                    </span>
                  </td>
                  <td className="descripcion-col">{log.descripcion}</td>
                  <td className="ip-col">{log.ip_direccion || "N/D"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditoriaLogs;
