import { useEffect, useState } from "react";
import "./Reportes.css";

function Reportes() {
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerReporte = async () => {
      try {
        const token = localStorage.getItem("access");

        const respuesta = await fetch(
          "http://127.0.0.1:8000/api/reportes/ventas/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo obtener el reporte");
        }

        const datos = await respuesta.json();
        setReporte(datos);
      } catch (error) {
        console.error(error);
        setError("No fue posible cargar el reporte.");
      }
    };

    obtenerReporte();
  }, []);

  // Formato para dinero
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor);
  };

  // Formato para fecha
  const formatoFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  if (error) {
    return <p className="error-reporte">{error}</p>;
  }

  if (!reporte) {
    return <p className="cargando">Cargando reporte...</p>;
  }

  return (
    <div className="reportes-container">

      {/* ENCABEZADO */}
      <div className="reportes-header">
        <h1>📊 Reportes y Análisis</h1>
        <p>
          Consulta y analiza la información de las ventas registradas
          en PlumixERP.
        </p>
      </div>

      {/* TARJETAS DE RESUMEN */}
      <div className="resumen-grid">

        <div className="resumen-card">
          <div className="icono">🛒</div>
          <h3>Cantidad de ventas</h3>
          <p>{reporte.resumen.cantidad_ventas}</p>
        </div>

        <div className="resumen-card">
          <div className="icono">💰</div>
          <h3>Subtotal</h3>
          <p>{formatoMoneda(reporte.resumen.subtotal)}</p>
        </div>

        <div className="resumen-card">
          <div className="icono">🧾</div>
          <h3>IVA</h3>
          <p>{formatoMoneda(reporte.resumen.iva)}</p>
        </div>

        <div className="resumen-card">
          <div className="icono">💵</div>
          <h3>Total vendido</h3>
          <p>{formatoMoneda(reporte.resumen.total_vendido)}</p>
        </div>

      </div>

      {/* TABLA */}
      <div className="ventas-section">

        <h2>Ventas registradas</h2>

        <div className="tabla-container">

          <table className="tabla-ventas">

            <thead>
              <tr>
                <th>N.º Venta</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Medio de pago</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>

              {reporte.ventas.map((venta) => (
                <tr key={venta.id}>

                  <td>#{venta.id}</td>

                  <td>{venta.cliente}</td>

                  <td>{formatoFecha(venta.fecha)}</td>

                  <td className="medio-pago">
                    {venta.medio_pago}
                  </td>

                  <td>
                    {formatoMoneda(venta.subtotal)}
                  </td>

                  <td>
                    {formatoMoneda(venta.iva)}
                  </td>

                  <td>
                    <strong>
                      {formatoMoneda(venta.total)}
                    </strong>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default Reportes;