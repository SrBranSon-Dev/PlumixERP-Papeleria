import { useEffect, useState } from "react";
import api from "../services/api";
import "./Productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [idEditar, setIdEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    proveedor: "",
    precio_compra: "",
    precio_venta: "",
    activo: true,
  });

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarProveedores();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  async function cargarProductos() {
    try {
      const respuesta = await api.get("productos/api/productos/");

      console.log("PRODUCTOS RECIBIDOS:", respuesta.data);

      setProductos(respuesta.data);
    } catch (error) {
      console.error("ERROR AL CARGAR PRODUCTOS:", error);
      console.error("RESPUESTA:", error.response?.data);
      console.error("ESTADO:", error.response?.status);
    }
  }

  const cargarCategorias = async () => {
    try {
      const respuesta = await api.get("productos/api/categorias/");
      setCategorias(respuesta.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const cargarProveedores = async () => {
    try {
      const respuesta = await api.get("proveedores/");
      setProveedores(respuesta.data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: "",
      descripcion: "",
      categoria: "",
      proveedor: "",
      precio_compra: "",
      precio_venta: "",
      activo: true,
    });

    setIdEditar(null);
  };

  const guardarProducto = async () => {
    if (
      !formulario.nombre.trim() ||
      !formulario.categoria ||
      !formulario.proveedor ||
      !formulario.precio_compra ||
      !formulario.precio_venta
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    try {
      const datos = {
  nombre: formulario.nombre,
  descripcion: formulario.descripcion,
  categoria: Number(formulario.categoria),
  proveedor: Number(formulario.proveedor),
  precio_compra: formulario.precio_compra,
  precio_venta: formulario.precio_venta,
  activo: formulario.activo,
};

      if (idEditar) {
        await api.put(
          `productos/api/productos/${idEditar}/`,
          datos
        );

        alert("Producto actualizado correctamente.");
      } else {
        await api.post(
          "productos/api/productos/",
          datos
        );

        alert("Producto registrado correctamente.");
      }

      await cargarProductos();
      limpiarFormulario();

    } catch (error) {
      console.error("ERROR COMPLETO:", error);

      if (error.response) {
        console.log(
          "Respuesta del servidor:",
          error.response.data
        );

        alert(
          "Error " +
            error.response.status +
            "\n\n" +
            JSON.stringify(
              error.response.data,
              null,
              2
            )
        );
      } else if (error.request) {
        alert("No hubo respuesta del servidor Django.");
      } else {
        alert(error.message);
      }
    }
  };

  const editarProducto = (producto) => {
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      categoria: producto.categoria,
      proveedor: producto.proveedor,
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      activo: producto.activo,
    });

    setIdEditar(producto.id);
  };

  const eliminarProducto = async (id) => {
    const confirmar = window.confirm(
      "¿Está seguro de eliminar este producto?"
    );

    if (!confirmar) return;

    try {
      await api.delete(
        `productos/api/productos/${id}/`
      );

      alert("Producto eliminado correctamente.");

      await cargarProductos();

    } catch (error) {
      console.error(error);
      alert("Error al eliminar el producto.");
    }
  };

  const obtenerNombreCategoria = (id) => {
    const categoria = categorias.find(
      (item) => item.id === id
    );

    return categoria ? categoria.nombre : id;
  };

  const obtenerNombreProveedor = (id) => {
    const proveedor = proveedores.find(
      (item) => item.id === id
    );

    return proveedor
      ? proveedor.nombre_empresa
      : id;
  };

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.codigo
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      producto.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  return (
    <div className="productos-container">

      <div className="productos-header">
        <h1>Gestión de Productos</h1>

        <p>
          Administra los productos de la papelería.
        </p>
      </div>

      <form
        className="productos-form"
        onSubmit={(e) => e.preventDefault()}
      >

        <div className="form-grid">

          <input
            type="text"
            name="nombre"
            placeholder="Nombre del producto"
            value={formulario.nombre}
            onChange={manejarCambio}
          />

          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={formulario.descripcion}
            onChange={manejarCambio}
          />

          <select
            name="categoria"
            value={formulario.categoria}
            onChange={manejarCambio}
          >
            <option value="">
              Seleccionar categoría
            </option>

            {categorias.map((categoria) => (
              <option
                key={categoria.id}
                value={categoria.id}
              >
                {categoria.nombre}
              </option>
            ))}
          </select>

          <select
            name="proveedor"
            value={formulario.proveedor}
            onChange={manejarCambio}
          >
            <option value="">
              Seleccionar proveedor
            </option>

            {proveedores.map((proveedor) => (
              <option
                key={proveedor.id}
                value={proveedor.id}
              >
                {proveedor.nombre_empresa}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="precio_compra"
            placeholder="Precio de compra"
            value={formulario.precio_compra}
            onChange={manejarCambio}
          />

          <input
            type="number"
            name="precio_venta"
            placeholder="Precio de venta"
            value={formulario.precio_venta}
            onChange={manejarCambio}
          />

        </div>

        <div className="form-actions">

          <button
            className="btn-guardar"
            type="button"
            onClick={guardarProducto}
          >
            {idEditar
              ? "Actualizar producto"
              : "Guardar producto"}
          </button>

          <button
            className="btn-limpiar"
            type="button"
            onClick={limpiarFormulario}
          >
            Limpiar
          </button>

        </div>

      </form>

      <div className="busqueda">

        <input
          type="text"
          placeholder="Buscar producto por código o nombre..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

      </div>

      <div className="tabla-card">

        <h2>Listado de Productos</h2>

        <p className="contador">
          Total de productos:{" "}
          <strong>{productos.length}</strong>
        </p>

        <table className="tabla-productos">

          <thead>

            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Proveedor</th>
              <th>Precio compra</th>
              <th>Precio venta</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>

          </thead>

          <tbody>

            {productosFiltrados.length === 0 ? (

              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  No hay productos registrados.
                </td>
              </tr>

            ) : (

              productosFiltrados.map((producto) => (

                <tr key={producto.id}>

                  <td>{producto.codigo}</td>

                  <td>{producto.nombre}</td>

                  <td>
                    {obtenerNombreCategoria(
                      producto.categoria
                    )}
                  </td>

                  <td>
                    {obtenerNombreProveedor(
                      producto.proveedor
                    )}
                  </td>

                  <td>
                    ${producto.precio_compra}
                  </td>

                  <td>
                    ${producto.precio_venta}
                  </td>

                  <td>{producto.stock}</td>

                  <td>

                    <button
                      className="btn-editar"
                      type="button"
                      onClick={() =>
                        editarProducto(producto)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="btn-eliminar"
                      type="button"
                      onClick={() =>
                        eliminarProducto(producto.id)
                      }
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

export default Productos;
