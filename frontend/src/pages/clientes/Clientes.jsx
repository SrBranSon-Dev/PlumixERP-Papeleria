import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import "./Clientes.css";

function Clientes() {
  const [clientes, setClientes] = useState([]);

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo_electronico: "",
    telefono: "",
    direccion: "",
  });

  const [idEditar, setIdEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const cargarClientes = useCallback(async () => {
    try {
      const respuesta = await api.get("clientes/");
      setClientes(respuesta.data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      cargarClientes();
    }, 0);

    return () => clearTimeout(temporizador);
  }, [cargarClientes]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: "",
      correo_electronico: "",
      telefono: "",
      direccion: "",
    });

    setIdEditar(null);
  };

  const guardarCliente = async () => {
    if (
      !formulario.nombre.trim() ||
      !formulario.correo_electronico.trim()
    ) {
      alert("Completa los campos obligatorios.");
      return;
    }

    try {
      if (idEditar) {
        await api.put(
          `clientes/${idEditar}/`,
          formulario
        );

        alert("Cliente actualizado correctamente.");
      } else {
        await api.post(
          "clientes/",
          formulario
        );

        alert("Cliente registrado correctamente.");
      }

      await cargarClientes();
      limpiarFormulario();

    } catch (error) {
      console.error("Error al guardar cliente:", error);

      if (error.response) {
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
      }
    }
  };

  const editarCliente = (cliente) => {
    setFormulario({
      nombre: cliente.nombre,
      correo_electronico: cliente.correo_electronico,
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
    });

    setIdEditar(cliente.id);
  };

  const eliminarCliente = async (id) => {
    const confirmar = window.confirm(
      "¿Está seguro de eliminar este cliente?"
    );

    if (!confirmar) return;

    try {
      await api.delete(`clientes/${id}/`);

      alert("Cliente eliminado correctamente.");

      await cargarClientes();

    } catch (error) {
      console.error("Error al eliminar cliente:", error);

      if (error.response) {
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
      }
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busqueda.toLowerCase();

    return (
      cliente.nombre
        .toLowerCase()
        .includes(texto) ||
      cliente.correo_electronico
        .toLowerCase()
        .includes(texto) ||
      (cliente.telefono || "")
        .toLowerCase()
        .includes(texto)
    );
  });

  return (
    <div className="clientes-container">

      <div className="clientes-header">
        <h1>Clientes</h1>

        <p>
          Gestiona los clientes registrados en el sistema.
        </p>
      </div>

      <div className="clientes-form">

        <div className="form-grid">

          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formulario.nombre}
            onChange={manejarCambio}
          />

          <input
            type="email"
            name="correo_electronico"
            placeholder="Correo electrónico"
            value={formulario.correo_electronico}
            onChange={manejarCambio}
          />

          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formulario.telefono}
            onChange={manejarCambio}
          />

          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formulario.direccion}
            onChange={manejarCambio}
          />

        </div>

        <div className="form-actions">

          <button
            className="btn-guardar"
            onClick={guardarCliente}
          >
            {idEditar
              ? "Actualizar cliente"
              : "Guardar cliente"}
          </button>

          <button
            className="btn-limpiar"
            onClick={limpiarFormulario}
          >
            Limpiar
          </button>

        </div>

      </div>

      <div className="busqueda">

        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

      </div>

      <div className="tabla-card">

        <h2>Clientes registrados</h2>

        <p className="contador">
          {clientesFiltrados.length} cliente(s)
        </p>

        <table className="tabla-clientes">

          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo electrónico</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>

                <td>
                  {cliente.nombre}
                </td>

                <td>
                  {cliente.correo_electronico}
                </td>

                <td>
                  {cliente.telefono || "—"}
                </td>

                <td>
                  {cliente.direccion || "—"}
                </td>

                <td>

                  <button
                    className="btn-editar"
                    onClick={() =>
                      editarCliente(cliente)
                    }
                  >
                    Editar
                  </button>

                  <button
                    className="btn-eliminar"
                    onClick={() =>
                      eliminarCliente(cliente.id)
                    }
                  >
                    Eliminar
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Clientes;