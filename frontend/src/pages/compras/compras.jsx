import { useEffect, useMemo, useState } from "react";
import { FaBoxes, FaPlus, FaReceipt, FaTrash } from "react-icons/fa";

import api from "../../services/api";
import "./compras.css";


const listaDesdeRespuesta = (data) => data?.results || data || [];

const estadoInicial = {
	proveedor: "",
	producto: "",
	cantidad: 1,
	precioUnitario: "",
};


function Compras() {
	const [proveedores, setProveedores] = useState([]);
	const [productos, setProductos] = useState([]);
	const [compras, setCompras] = useState([]);
	const [formulario, setFormulario] = useState(estadoInicial);
	const [detalles, setDetalles] = useState([]);
	const [busqueda, setBusqueda] = useState("");
	const [cargando, setCargando] = useState(true);
	const [guardando, setGuardando] = useState(false);
	const [error, setError] = useState("");

	const cargarDatos = async () => {
		setCargando(true);
		setError("");

		try {
			const [proveedoresRespuesta, productosRespuesta, comprasRespuesta] =
				await Promise.all([
					api.get("proveedores/"),
					api.get("productos/api/productos/"),
					api.get("compras/compras/"),
				]);

			setProveedores(listaDesdeRespuesta(proveedoresRespuesta.data));
			setProductos(listaDesdeRespuesta(productosRespuesta.data));
			setCompras(listaDesdeRespuesta(comprasRespuesta.data));
		} catch (requestError) {
			console.error("Error cargando compras:", requestError);
			setError("No fue posible cargar la información de compras.");
		} finally {
			setCargando(false);
		}
	};

	useEffect(() => {
		queueMicrotask(() => cargarDatos());
	}, []);

	const manejarProveedor = (event) => {
		setFormulario((actual) => ({
			...actual,
			proveedor: event.target.value,
		}));
	};

	const manejarProducto = (event) => {
		const productoId = event.target.value;
		const producto = productos.find(
			(item) => String(item.id) === String(productoId),
		);

		setFormulario((actual) => ({
			...actual,
			producto: productoId,
			precioUnitario: producto?.precio_compra || "",
		}));
	};

	const agregarDetalle = () => {
		const producto = productos.find(
			(item) => String(item.id) === String(formulario.producto),
		);
		const cantidad = Number(formulario.cantidad);
		const precioUnitario = Number(formulario.precioUnitario);

		if (!producto) {
			setError("Selecciona un producto para agregarlo a la compra.");
			return;
		}

		if (!Number.isInteger(cantidad) || cantidad <= 0) {
			setError("La cantidad debe ser un número entero mayor que cero.");
			return;
		}

		if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
			setError("El precio unitario no es válido.");
			return;
		}

		setError("");
		setDetalles((actuales) => {
			const existente = actuales.find((item) => item.producto === producto.id);

			if (existente) {
				return actuales.map((item) => {
					if (item.producto !== producto.id) return item;

					const nuevaCantidad = item.cantidad + cantidad;
					return {
						...item,
						cantidad: nuevaCantidad,
						subtotal: nuevaCantidad * item.precio_unitario,
					};
				});
			}

			return [
				...actuales,
				{
					producto: producto.id,
					nombre: producto.nombre,
					codigo: producto.codigo,
					cantidad,
					precio_unitario: precioUnitario,
					subtotal: cantidad * precioUnitario,
				},
			];
		});

		setFormulario((actual) => ({
			...actual,
			producto: "",
			cantidad: 1,
			precioUnitario: "",
		}));
	};

	const eliminarDetalle = (productoId) => {
		setDetalles((actuales) =>
			actuales.filter((detalle) => detalle.producto !== productoId),
		);
	};

	const limpiarFormulario = () => {
		setFormulario(estadoInicial);
		setDetalles([]);
		setError("");
	};

	const totalCompra = useMemo(
		() => detalles.reduce((total, detalle) => total + detalle.subtotal, 0),
		[detalles],
	);

	const guardarCompra = async (event) => {
		event.preventDefault();

		if (!formulario.proveedor) {
			setError("Selecciona el proveedor de la compra.");
			return;
		}

		if (detalles.length === 0) {
			setError("Agrega al menos un producto a la compra.");
			return;
		}

		setGuardando(true);
		setError("");

		try {
			const compraRespuesta = await api.post("compras/compras/", {
				proveedor: Number(formulario.proveedor),
				estado: true,
			});

			await Promise.all(
				detalles.map((detalle) =>
					api.post("compras/detalles-compra/", {
						compra: compraRespuesta.data.id,
						producto: detalle.producto,
						cantidad: detalle.cantidad,
						precio_unitario: detalle.precio_unitario,
					}),
				),
			);

			limpiarFormulario();
			await cargarDatos();
		} catch (requestError) {
			console.error("Error guardando compra:", requestError);
			setError(
				requestError.response?.data
					? JSON.stringify(requestError.response.data)
					: "No fue posible registrar la compra.",
			);
		} finally {
			setGuardando(false);
		}
	};

	const comprasFiltradas = compras.filter((compra) => {
		const proveedor = proveedores.find(
			(item) => Number(item.id) === Number(compra.proveedor),
		);
		const texto = `${compra.id} ${proveedor?.nombre_empresa || ""}`;
		return texto.toLowerCase().includes(busqueda.toLowerCase());
	});

	const formatoMoneda = (valor) =>
		Number(valor || 0).toLocaleString("es-CO", {
			style: "currency",
			currency: "COP",
			maximumFractionDigits: 0,
		});

	const formatoFecha = (fecha) =>
		fecha ? new Date(fecha).toLocaleDateString("es-CO") : "-";

	const nombreProveedor = (proveedorId) => {
		const proveedor = proveedores.find(
			(item) => Number(item.id) === Number(proveedorId),
		);
		return proveedor?.nombre_empresa || `Proveedor #${proveedorId}`;
	};

	return (
		<main className="compras-page">
			<header className="compras-header">
				<div>
					<span className="compras-kicker">Abastecimiento</span>
					<h1>Gestión de compras</h1>
					<p>Registra las entradas de mercancía y mantén actualizado el inventario.</p>
				</div>
				<div className="compras-header-mark" aria-hidden="true">
					<FaBoxes />
				</div>
			</header>

			{error && <div className="compras-alert">{error}</div>}

			<section className="compras-layout">
				<form className="compra-form-card" onSubmit={guardarCompra}>
					<div className="section-heading">
						<div>
							<span className="section-eyebrow">Nueva entrada</span>
							<h2>Registrar compra</h2>
						</div>
						<FaReceipt aria-hidden="true" />
					</div>

					<label htmlFor="compra-proveedor">Proveedor</label>
					<select
						id="compra-proveedor"
						value={formulario.proveedor}
						onChange={manejarProveedor}
						required
					>
						<option value="">Selecciona un proveedor</option>
						{proveedores.map((proveedor) => (
							<option key={proveedor.id} value={proveedor.id}>
								{proveedor.nombre_empresa}
							</option>
						))}
					</select>

					<div className="compra-product-row">
						<div>
							<label htmlFor="compra-producto">Producto</label>
							<select
								id="compra-producto"
								value={formulario.producto}
								onChange={manejarProducto}
							>
								<option value="">Selecciona un producto</option>
								{productos.filter((producto) => producto.activo !== false).map((producto) => (
									<option key={producto.id} value={producto.id}>
										{producto.codigo} · {producto.nombre}
									</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor="compra-cantidad">Cantidad</label>
							<input
								id="compra-cantidad"
								type="number"
								min="1"
								step="1"
								value={formulario.cantidad}
								onChange={(event) =>
									setFormulario((actual) => ({
										...actual,
										cantidad: event.target.value,
									}))
								}
							/>
						</div>
						<div>
							<label htmlFor="compra-precio">Precio unitario</label>
							<input
								id="compra-precio"
								type="number"
								min="0"
								step="0.01"
								value={formulario.precioUnitario}
								onChange={(event) =>
									setFormulario((actual) => ({
										...actual,
										precioUnitario: event.target.value,
									}))
								}
							/>
						</div>
					</div>

					<button className="btn-add-detail" type="button" onClick={agregarDetalle}>
						<FaPlus /> Agregar producto
					</button>

					<div className="detalle-preview">
						<div className="detalle-preview-header">
							<h3>Detalle de la compra</h3>
							<span>{detalles.length} productos</span>
						</div>
						{detalles.length === 0 ? (
							<p className="empty-detail">Agrega productos para construir la compra.</p>
						) : (
							<div className="detalle-lista">
								{detalles.map((detalle) => (
									<div className="detalle-row" key={detalle.producto}>
										<div>
											<strong>{detalle.nombre}</strong>
											<small>{detalle.codigo} · {detalle.cantidad} unidades</small>
										</div>
										<span>{formatoMoneda(detalle.subtotal)}</span>
										<button
											className="icon-button danger"
											type="button"
											title={`Eliminar ${detalle.nombre}`}
											aria-label={`Eliminar ${detalle.nombre}`}
											onClick={() => eliminarDetalle(detalle.producto)}
										>
											<FaTrash />
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="compra-total">
						<span>Total de la compra</span>
						<strong>{formatoMoneda(totalCompra)}</strong>
					</div>

					<div className="compra-actions">
						<button className="btn-secondary" type="button" onClick={limpiarFormulario}>
							Limpiar
						</button>
						<button className="btn-primary" type="submit" disabled={guardando}>
							{guardando ? "Guardando..." : "Registrar compra"}
						</button>
					</div>
				</form>

				<aside className="compras-summary">
					<div className="summary-label">Compras registradas</div>
					<strong>{compras.length}</strong>
					<p>Movimientos de entrada almacenados en el sistema.</p>
					<div className="summary-rule" />
					<div className="summary-label">Total acumulado</div>
					<strong>{formatoMoneda(compras.reduce((total, compra) => total + Number(compra.total || 0), 0))}</strong>
				</aside>
			</section>

			<section className="compras-history">
				<div className="history-heading">
					<div>
						<span className="section-eyebrow">Control de entradas</span>
						<h2>Historial de compras</h2>
					</div>
					<input
						type="search"
						placeholder="Buscar por proveedor o número"
						value={busqueda}
						onChange={(event) => setBusqueda(event.target.value)}
						aria-label="Buscar compras"
					/>
				</div>

				{cargando ? (
					<div className="table-message">Cargando compras...</div>
				) : comprasFiltradas.length === 0 ? (
					<div className="table-message">No hay compras que mostrar.</div>
				) : (
					<div className="table-scroll">
						<table className="compras-table">
							<thead>
								<tr>
									<th>Compra</th>
									<th>Proveedor</th>
									<th>Fecha</th>
									<th>Estado</th>
									<th className="align-right">Total</th>
								</tr>
							</thead>
							<tbody>
								{comprasFiltradas.map((compra) => (
									<tr key={compra.id}>
										<td className="purchase-number">#{compra.id}</td>
										<td>{nombreProveedor(compra.proveedor)}</td>
										<td>{formatoFecha(compra.fecha)}</td>
										<td>
											<span className={`purchase-status ${compra.estado ? "is-active" : "is-inactive"}`}>
												{compra.estado ? "Activa" : "Inactiva"}
											</span>
										</td>
										<td className="align-right purchase-total">{formatoMoneda(compra.total)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</main>
	);
}

export default Compras;
