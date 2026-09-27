from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class ResolucionFacturacion(models.Model):

	prefijo = models.CharField(max_length=10, unique=True)
	numero_inicial = models.PositiveIntegerField()
	numero_final = models.PositiveIntegerField()
	numero_actual = models.PositiveIntegerField()
	clave_tecnica = models.CharField(max_length=100, blank=True)
	fecha_inicio = models.DateField()
	fecha_fin = models.DateField()
	activa = models.BooleanField(default=True)

	def clean(self):
		if self.numero_inicial > self.numero_final:
			raise ValidationError(
				"El número inicial no puede ser mayor que el final."
			)
		if not self.numero_inicial <= self.numero_actual <= self.numero_final:
			raise ValidationError(
				"El número actual debe estar dentro del rango autorizado."
			)
		if self.fecha_inicio > self.fecha_fin:
			raise ValidationError(
				"La fecha inicial no puede ser posterior a la fecha final."
			)

	def save(self, *args, **kwargs):
		self.full_clean()
		super().save(*args, **kwargs)

	def __str__(self):
		return f"Resolución {self.prefijo}"


class FacturaElectronica(models.Model):

	class TipoDocumento(models.TextChoices):
		FACTURA = "FACTURA", "Factura electrónica"
		NOTA_CREDITO = "NOTA_CREDITO", "Nota crédito"
		NOTA_DEBITO = "NOTA_DEBITO", "Nota débito"

	class Estado(models.TextChoices):
		BORRADOR = "BORRADOR", "Borrador"
		GENERADA = "GENERADA", "Generada"
		ENVIADA = "ENVIADA", "Enviada a DIAN"
		ACEPTADA = "ACEPTADA", "Aceptada"
		RECHAZADA = "RECHAZADA", "Rechazada"
		ANULADA = "ANULADA", "Anulada"

	class MedioPago(models.TextChoices):
		EFECTIVO = "EFECTIVO", "Efectivo"
		TARJETA = "TARJETA", "Tarjeta"
		TRANSFERENCIA = "TRANSFERENCIA", "Transferencia"

	venta = models.OneToOneField(
		"ventas.Venta",
		on_delete=models.PROTECT,
		related_name="factura_electronica",
	)
	cliente = models.ForeignKey(
		"clientes.Cliente",
		on_delete=models.PROTECT,
		related_name="facturas_electronicas",
	)
	resolucion = models.ForeignKey(
		ResolucionFacturacion,
		on_delete=models.PROTECT,
		related_name="facturas",
	)
	usuario_creacion = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="facturas_creadas",
	)
	tipo_documento = models.CharField(
		max_length=20,
		choices=TipoDocumento.choices,
		default=TipoDocumento.FACTURA,
	)
	consecutivo = models.PositiveIntegerField()
	numero = models.CharField(max_length=30, unique=True)
	fecha_emision = models.DateTimeField(auto_now_add=True)
	fecha_vencimiento = models.DateField(null=True, blank=True)
	medio_pago = models.CharField(
		max_length=20,
		choices=MedioPago.choices,
		default=MedioPago.EFECTIVO,
	)
	estado = models.CharField(
		max_length=20,
		choices=Estado.choices,
		default=Estado.BORRADOR,
	)

	cliente_nombre = models.CharField(max_length=150)
	cliente_identificacion = models.CharField(max_length=50, blank=True)
	cliente_correo = models.EmailField(blank=True)
	cliente_direccion = models.TextField(blank=True)

	subtotal = models.DecimalField(
		max_digits=14,
		decimal_places=2,
		default=Decimal("0.00"),
	)
	descuento = models.DecimalField(
		max_digits=14,
		decimal_places=2,
		default=Decimal("0.00"),
	)
	impuesto = models.DecimalField(
		max_digits=14,
		decimal_places=2,
		default=Decimal("0.00"),
	)
	total = models.DecimalField(
		max_digits=14,
		decimal_places=2,
		default=Decimal("0.00"),
	)

	cufe = models.CharField(max_length=100, unique=True, null=True, blank=True)
	xml = models.TextField(blank=True)
	codigo_qr = models.TextField(blank=True)
	respuesta_dian = models.JSONField(default=dict, blank=True)
	observaciones = models.TextField(blank=True)
	creada_en = models.DateTimeField(auto_now_add=True)
	actualizada_en = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-fecha_emision"]
		constraints = [
			models.UniqueConstraint(
				fields=["resolucion", "consecutivo"],
				name="factura_resolucion_consecutivo_unico",
			),
		]

	def clean(self):
		if self.venta_id and self.cliente_id:
			if self.venta.cliente_id != self.cliente_id:
				raise ValidationError(
					"El cliente de la factura debe coincidir con el de la venta."
				)

		if self.resolucion_id and not self.resolucion.activa:
			raise ValidationError("La resolución de facturación está inactiva.")

	def save(self, *args, **kwargs):
		if not self.pk and self.cliente_id:
			self.cliente_nombre = self.cliente.nombre
			self.cliente_correo = self.cliente.correo_electronico
			self.cliente_direccion = self.cliente.direccion or ""

		self.full_clean()
		super().save(*args, **kwargs)

	def actualizar_totales(self):
		totales = self.detalles.aggregate(
			subtotal=models.Sum("subtotal"),
			descuento=models.Sum("descuento"),
			impuesto=models.Sum("impuesto"),
			total=models.Sum("total"),
		)
		self.subtotal = totales["subtotal"] or Decimal("0.00")
		self.descuento = totales["descuento"] or Decimal("0.00")
		self.impuesto = totales["impuesto"] or Decimal("0.00")
		self.total = totales["total"] or Decimal("0.00")
		self.save(
			update_fields=[
				"subtotal",
				"descuento",
				"impuesto",
				"total",
				"actualizada_en",
			]
		)

	def __str__(self):
		return self.numero


class DetalleFacturaElectronica(models.Model):

	factura = models.ForeignKey(
		FacturaElectronica,
		on_delete=models.CASCADE,
		related_name="detalles",
	)
	detalle_venta = models.OneToOneField(
		"ventas.DetalleVenta",
		on_delete=models.PROTECT,
		related_name="detalle_factura",
	)
	producto = models.ForeignKey(
		"productos.Producto",
		on_delete=models.PROTECT,
		related_name="detalles_factura",
	)
	descripcion = models.CharField(max_length=200)
	codigo_producto = models.CharField(max_length=20)
	cantidad = models.PositiveIntegerField()
	precio_unitario = models.DecimalField(max_digits=14, decimal_places=2)
	descuento = models.DecimalField(
		max_digits=14,
		decimal_places=2,
		default=Decimal("0.00"),
	)
	porcentaje_iva = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		default=Decimal("19.00"),
	)
	subtotal = models.DecimalField(max_digits=14, decimal_places=2)
	impuesto = models.DecimalField(
		max_digits=14,
		decimal_places=2,
		default=Decimal("0.00"),
	)
	total = models.DecimalField(max_digits=14, decimal_places=2)

	def save(self, *args, **kwargs):
		self.subtotal = self.cantidad * self.precio_unitario
		base = self.subtotal - self.descuento
		if base < 0:
			raise ValidationError(
				"El descuento no puede superar el subtotal del detalle."
			)
		self.impuesto = base * self.porcentaje_iva / Decimal("100")
		self.total = base + self.impuesto
		self.full_clean()
		super().save(*args, **kwargs)
		self.factura.actualizar_totales()

	def clean(self):
		if self.factura_id and self.detalle_venta_id:
			if self.detalle_venta.venta_id != self.factura.venta_id:
				raise ValidationError(
					"El detalle de venta no pertenece a la venta facturada."
				)

		if self.detalle_venta_id and self.producto_id:
			if self.detalle_venta.producto_id != self.producto_id:
				raise ValidationError(
					"El producto debe coincidir con el detalle de venta."
				)

		if self.detalle_venta_id:
			if self.cantidad != self.detalle_venta.cantidad:
				raise ValidationError(
					"La cantidad debe coincidir con el detalle de venta."
				)
			if self.precio_unitario != self.detalle_venta.valor_unitario:
				raise ValidationError(
					"El precio debe coincidir con el detalle de venta."
				)

	def delete(self, *args, **kwargs):
		factura = self.factura
		super().delete(*args, **kwargs)
		factura.actualizar_totales()

	def __str__(self):
		return f"{self.factura.numero} - {self.descripcion}"


class ImpuestoFactura(models.Model):

	factura = models.ForeignKey(
		FacturaElectronica,
		on_delete=models.CASCADE,
		related_name="impuestos",
	)
	detalle = models.ForeignKey(
		DetalleFacturaElectronica,
		on_delete=models.CASCADE,
		related_name="impuestos",
		null=True,
		blank=True,
	)
	codigo = models.CharField(max_length=20)
	nombre = models.CharField(max_length=80)
	porcentaje = models.DecimalField(max_digits=5, decimal_places=2)
	base = models.DecimalField(max_digits=14, decimal_places=2)
	valor = models.DecimalField(max_digits=14, decimal_places=2)

	def clean(self):
		valor_esperado = self.base * self.porcentaje / Decimal("100")
		if self.valor != valor_esperado:
			raise ValidationError(
				"El valor del impuesto no coincide con su base y porcentaje."
			)

	def save(self, *args, **kwargs):
		self.full_clean()
		super().save(*args, **kwargs)

	def __str__(self):
		return f"{self.factura.numero} - {self.nombre}"


class EventoDian(models.Model):

	factura = models.ForeignKey(
		FacturaElectronica,
		on_delete=models.CASCADE,
		related_name="eventos_dian",
	)
	codigo = models.CharField(max_length=30)
	estado = models.CharField(max_length=30)
	mensaje = models.TextField(blank=True)
	identificador = models.CharField(max_length=100, blank=True)
	respuesta = models.JSONField(default=dict, blank=True)
	fecha_evento = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-fecha_evento"]

	def __str__(self):
		return f"{self.factura.numero} - {self.codigo}"
