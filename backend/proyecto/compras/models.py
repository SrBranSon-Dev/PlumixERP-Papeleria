from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models, transaction
from proveedores.models import Proveedor
from productos.models import Producto, Inventario


# ENTIDAD: COMPRA
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

    def actualizar_total(self):
        self.total = self.detalles.aggregate(
            total=models.Sum("subtotal")
        )["total"] or Decimal("0.00")
        self.save(update_fields=["total"])

    def __str__(self):
        return f"Compra #{self.id}"


# ENTIDAD: DETALLE DE COMPRA
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

    def clean(self):
        if self.cantidad <= 0:
            raise ValidationError({"cantidad": "La cantidad debe ser mayor que cero."})

        if self.precio_unitario < 0:
            raise ValidationError(
                {"precio_unitario": "El precio unitario no puede ser negativo."}
            )

        subtotal_esperado = self.cantidad * self.precio_unitario
        if self.subtotal != subtotal_esperado:
            raise ValidationError(
                {"subtotal": "El subtotal debe ser cantidad por precio unitario."}
            )

    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_unitario

        with transaction.atomic():
            if self.pk:
                detalle_anterior = DetalleCompra.objects.select_for_update().get(
                    pk=self.pk
                )

                if detalle_anterior.producto_id != self.producto_id:
                    inventario_anterior = Inventario.objects.select_for_update().get(
                        producto_id=detalle_anterior.producto_id
                    )
                    if inventario_anterior.cantidad < detalle_anterior.cantidad:
                        raise ValidationError(
                            "No hay inventario suficiente para revertir el detalle anterior."
                        )
                    inventario_anterior.cantidad -= detalle_anterior.cantidad
                    inventario_anterior.save(update_fields=["cantidad"])

                    inventario_nuevo, _ = Inventario.objects.select_for_update().get_or_create(
                        producto_id=self.producto_id
                    )
                    inventario_nuevo.cantidad += self.cantidad
                    inventario_nuevo.save(update_fields=["cantidad"])
                else:
                    inventario, _ = Inventario.objects.select_for_update().get_or_create(
                        producto_id=self.producto_id
                    )
                    diferencia = self.cantidad - detalle_anterior.cantidad
                    if diferencia < 0 and inventario.cantidad < abs(diferencia):
                        raise ValidationError(
                            "No hay inventario suficiente para reducir este detalle."
                        )
                    inventario.cantidad += diferencia
                    inventario.save(update_fields=["cantidad"])
            else:
                inventario, _ = Inventario.objects.select_for_update().get_or_create(
                    producto_id=self.producto_id
                )
                inventario.cantidad += self.cantidad
                inventario.save(update_fields=["cantidad"])

            self.full_clean()
            super().save(*args, **kwargs)
            self.compra.actualizar_total()

    def delete(self, *args, **kwargs):
        with transaction.atomic():
            inventario = Inventario.objects.select_for_update().get(
                producto_id=self.producto_id
            )
            if inventario.cantidad < self.cantidad:
                raise ValidationError(
                    "No se puede eliminar la compra porque el inventario ya fue utilizado."
                )

            inventario.cantidad -= self.cantidad
            inventario.save(update_fields=["cantidad"])
            compra = self.compra
            resultado = super().delete(*args, **kwargs)
            compra.actualizar_total()

        return resultado

    def __str__(self):
        return f"Detalle de Compra #{self.id}"