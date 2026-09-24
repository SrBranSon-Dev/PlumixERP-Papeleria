import { useEffect, useState } from "react";
import api from "../services/api";
import "./Ventas.css";

function Ventas() {
  // =========================================================
  // ESTADOS
  // =========================================================

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [medioPago, setMedioPago] = useState("EFECTIVO");

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [productosVenta, setProductosVenta] = useState([]);

  const [guardando, setGuardando] = useState(false);
  const [cargandoVentas, setCargandoVentas] = useState(false);

  // =========================================================
  // CARGAR DATOS AL INICIAR
  // =========================================================

  useEffect(() => {
    cargarClientes();
    cargarProductos();
    cargarVentas();
  }, []);

  // =========================================================
  // CARGAR CLIENTES
  // =========================================================

  const cargarClientes = async () => {
    try {
      const respuesta = await api.get("clientes/");
      console.log("Clientes recibidos:", respuesta.data);
      setClientes(respuesta.data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      alert("No fue posible cargar los clientes.");
    }
  };

  // =========================================================
  // CARGAR PRODUCTOS
  // =========================================================

  const cargarProductos = async () => {
    try {
      const respuesta = await api.get("productos/api/productos/");
      console.log("Productos recibidos:", respuesta.data);
      setProductos(respuesta.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      alert("No fue posible cargar los productos.");
    }
  };

  // =========================================================
  // CARGAR VENTAS REGISTRADAS
  // =========================================================

  const cargarVentas = async () => {
    try {
      setCargandoVentas(true);

      const respuesta = await api.get("ventas/ventas/");

      console.log("Ventas registradas:", respuesta.data);

      setVentas(respuesta.data);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setCargandoVentas(false);
    }
  };

  // =========================================================
  // AGREGAR PRODUCTO
  // =========================================================

  const agregarProducto = () => {
    if (!productoSeleccionado) {
      alert("Seleccione un producto.");
      return;
    }

    if (!cantidad || Number(cantidad) <= 0) {
      alert("La cantidad debe ser mayor que 0.");
      return;
    }

    const producto = productos.find(
      (p) => String(p.id) === String(productoSeleccionado)
    );

    if (!producto) {
      alert("No se encontró el producto.");
      return;
    }

    const precio = Number(producto.precio_venta);

    if (isNaN(precio) || precio < 0) {
      alert("El producto no tiene un precio válido.");
      return;
    }

    const cantidadNumerica = Number(cantidad);

    const productoExistente = productosVenta.find(
      (p) => p.id === producto.id
    );

    if (productoExistente) {
      const nuevaCantidad =
        productoExistente.cantidad + cantidadNumerica;

      setProductosVenta((productosActuales) =>
        productosActuales.map((p) =>
          p.id === producto.id
            ? {
                ...p,
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * p.precio_venta,
              }
            : p
        )
      );
    } else {
      const nuevoProducto = {
        id: producto.id,
        nombre: producto.nombre,
        codigo: producto.codigo,
        precio_venta: precio,
        cantidad: cantidadNumerica,
        subtotal: precio * cantidadNumerica,
      };

      setProductosVenta((productosActuales) => [
        ...productosActuales,
        nuevoProducto,
      ]);
    }

    setProductoSeleccionado("");
    setCantidad(1);
  };

  // =========================================================
  // ELIMINAR PRODUCTO
  // =========================================================

  const eliminarProducto = (id) => {
    setProductosVenta((productosActuales) =>
      productosActuales.filter((producto) => producto.id !== id)
    );
  };

  // =========================================================
  // LIMPIAR FORMULARIO
  // =========================================================

  const limpiarVenta = () => {
    setClienteSeleccionado("");
    setMedioPago("EFECTIVO");
    setProductoSeleccionado("");
    setCantidad(1);
    setProductosVenta([]);
  };

  // =========================================================
  // TOTALES
  // =========================================================

  const subtotal = productosVenta.reduce(
    (total, producto) => total + Number(producto.subtotal),
    0
  );

  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  // =========================================================
  // GUARDAR VENTA
  // =========================================================

  const guardarVenta = async () => {
    if (!clienteSeleccionado) {
      alert("Seleccione un cliente.");
      return;
    }

    if (productosVenta.length === 0) {
      alert("Debe agregar al menos un producto.");
      return;
    }

    try {
      setGuardando(true);

      // Crear venta
      const ventaData = {
        cliente: Number(clienteSeleccionado),
        medio_pago: medioPago,
      };

      console.log("Creando venta:", ventaData);

      const respuestaVenta = await api.post(
        "ventas/ventas/",
        ventaData
      );

      const ventaCreada = respuestaVenta.data;

      console.log("Venta creada:", ventaCreada);

      // Crear detalles
      for (const producto of productosVenta) {
        const detalleData = {
          venta: ventaCreada.id,
          producto: producto.id,
          cantidad: producto.cantidad,
          valor_unitario: producto.precio_venta,
        };

        console.log("Creando detalle:", detalleData);

        await api.post(
          "ventas/detalles-venta/",
          detalleData
        );
      }

      // Consultar venta actualizada
      const ventaActualizada = await api.get(
        `ventas/ventas/${ventaCreada.id}/`
      );

      console.log(
        "Venta final:",
        ventaActualizada.data
      );

      alert(
        `Venta #${ventaCreada.id} registrada correctamente.\n\n` +
        `Subtotal: ${formatoMoneda(ventaActualizada.data.subtotal)}\n` +
        `IVA: ${formatoMoneda(ventaActualizada.data.iva)}\n` +
        `Total: ${formatoMoneda(ventaActualizada.data.total)}`
      );

      // Limpiar formulario
      limpiarVenta();

      // Actualizar listado de ventas
      cargarVentas();

    } catch (error) {
      console.error("Error guardando la venta:", error);

      if (error.response) {
        console.error(
          "Respuesta del servidor:",
          error.response.data
        );

        alert(
          "El servidor rechazó la operación:\n\n" +
          JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert("No fue posible guardar la venta.");
      }
    } finally {
      setGuardando(false);
    }
  };

  // =========================================================
  // FORMATO MONEDA
  // =========================================================

  const formatoMoneda = (valor) => {
    return Number(valor).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  };

  // =========================================================
  // OBTENER NOMBRE DEL CLIENTE
  // =========================================================

  const obtenerNombreCliente = (clienteId) => {
    const cliente = clientes.find(
      (c) => Number(c.id) === Number(clienteId)
    );

    if (!cliente) {
      return `Cliente #${clienteId}`;
    }

    return (
      cliente.nombre ||
      cliente.nombre_completo ||
      `Cliente #${cliente.id}`
    );
  };

  // =========================================================
  // FORMATO FECHA
  // =========================================================

  const formatoFecha = (fecha) => {
    if (!fecha) {
      return "-";
    }

    return new Date(fecha).toLocaleString("es-CO");
  };

  // =========================================================
  // VISTA
  // =========================================================

  return (
    <div className="ventas-container">

      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className="ventas-header">
        <h1>Gestión de Ventas</h1>

        <p>
          Registra y administra las ventas
          realizadas en la papelería.
        </p>
      </div>

      {/* =====================================================
          FORMULARIO
      ====================================================== */}

      <div className="ventas-form">

        <h2>Registrar nueva venta</h2>

        <div className="form-grid">

          {/* Cliente */}

          <select
            value={clienteSeleccionado}
            onChange={(e) =>
              setClienteSeleccionado(e.target.value)
            }
          >
            <option value="">
              Seleccionar cliente
            </option>

            {clientes.map((cliente) => (
              <option
                key={cliente.id}
                value={cliente.id}
              >
                {cliente.nombre ||
                  cliente.nombre_completo ||
                  `Cliente ${cliente.id}`}
              </option>
            ))}
          </select>

          {/* Medio de pago */}

          <select
            value={medioPago}
            onChange={(e) =>
              setMedioPago(e.target.value)
            }
          >
            <option value="EFECTIVO">
              Efectivo
            </option>

            <option value="TRANSFERENCIA">
              Transferencia
            </option>

            <option value="TARJETA">
              Tarjeta
            </option>
          </select>

          {/* Producto */}

          <select
            value={productoSeleccionado}
            onChange={(e) =>
              setProductoSeleccionado(e.target.value)
            }
          >
            <option value="">
              Seleccionar producto
            </option>

            {productos.map((producto) => (
              <option
                key={producto.id}
                value={producto.id}
              >
                {producto.nombre} -{" "}
                {formatoMoneda(producto.precio_venta)}
              </option>
            ))}
          </select>

          {/* Cantidad */}

          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) =>
              setCantidad(Number(e.target.value))
            }
            placeholder="Cantidad"
          />

        </div>

        <div className="form-actions">

          <button
            type="button"
            className="btn-limpiar"
            onClick={limpiarVenta}
            disabled={
              !clienteSeleccionado &&
              productosVenta.length === 0
            }
          >
            Limpiar
          </button>

          <button
            type="button"
            className="btn-guardar"
            onClick={agregarProducto}
          >
            Agregar producto
          </button>

        </div>

      </div>

      {/* =====================================================
          PRODUCTOS DE LA VENTA
      ====================================================== */}

      <div className="tabla-card">

        <h2>Productos de la venta</h2>

        {productosVenta.length === 0 ? (

          <p>
            No hay productos agregados a esta venta.
          </p>

        ) : (

          <table className="tabla-ventas">

            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>

              {productosVenta.map((producto) => (
                <tr key={producto.id}>

                  <td>{producto.nombre}</td>

                  <td>{producto.codigo}</td>

                  <td>{producto.cantidad}</td>

                  <td>
                    {formatoMoneda(
                      producto.precio_venta
                    )}
                  </td>

                  <td>
                    {formatoMoneda(
                      producto.subtotal
                    )}
                  </td>

                  <td>

                    <button
                      type="button"
                      className="btn-eliminar"
                      onClick={() =>
                        eliminarProducto(producto.id)
                      }
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        )}

        {/* Totales */}

        <div className="totales-venta">

          <p>
            Subtotal:
            <strong>
              {formatoMoneda(subtotal)}
            </strong>
          </p>

          <p>
            IVA (19%):
            <strong>
              {formatoMoneda(iva)}
            </strong>
          </p>

          <p className="total-venta">
            Total:
            <strong>
              {formatoMoneda(total)}
            </strong>
          </p>

        </div>

        {/* Guardar */}

        <div className="form-actions">

          <button
            type="button"
            className="btn-guardar"
            onClick={guardarVenta}
            disabled={
              productosVenta.length === 0 ||
              !clienteSeleccionado ||
              guardando
            }
          >
            {guardando
              ? "Guardando..."
              : "Guardar venta"}
          </button>

        </div>

      </div>

      {/* =====================================================
          VENTAS REGISTRADAS
      ====================================================== */}

      <div className="tabla-card ventas-registradas">

        <h2>Ventas registradas</h2>

        {cargandoVentas ? (

          <p>Cargando ventas...</p>

        ) : ventas.length === 0 ? (

          <p>
            No hay ventas registradas.
          </p>

        ) : (

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

              {ventas.map((venta) => (

                <tr key={venta.id}>

                  <td>
                    #{venta.id}
                  </td>

                  <td>
                    {obtenerNombreCliente(
                      venta.cliente
                    )}
                  </td>

                  <td>
                    {formatoFecha(venta.fecha)}
                  </td>

                  <td>
                    {venta.medio_pago}
                  </td>

                  <td>
                    {formatoMoneda(
                      venta.subtotal
                    )}
                  </td>

                  <td>
                    {formatoMoneda(
                      venta.iva
                    )}
                  </td>

                  <td>
                    <strong>
                      {formatoMoneda(
                        venta.total
                      )}
                    </strong>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default Ventas;