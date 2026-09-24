from django.db import models
from proveedores.models import Proveedor
from productos.models import Producto


class Compra(models.Model):
    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.PROTECT,
        related_name="compras"
    )

    fecha = models.DateTimeField(
        auto_now_add=True
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    estado = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"Compra #{self.id}"


class DetalleCompra(models.Model):
    compra = models.ForeignKey(
        Compra,
        on_delete=models.CASCADE,
        related_name="detalles"
    )

    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name="detalles_compra"
    )

    cantidad = models.PositiveIntegerField()

    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Detalle de Compra #{self.id}"