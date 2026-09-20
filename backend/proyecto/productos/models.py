from django.db import models
from proveedores.models import Proveedor
import random


# ENTIDAD: CATEGORIA
class Categoria(models.Model):
    nombre = models.CharField(
        max_length=100,
        unique=True
    )

    descripcion = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        db_table = "categoria"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


# ENTIDAD: PRODUCTO
class Producto(models.Model):
    codigo = models.CharField(
        max_length=20,
        unique=True,
        blank=True
    )

    nombre = models.CharField(
        max_length=120
    )

    descripcion = models.TextField(
        blank=True,
        null=True
    )

    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name="productos"
    )

    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.PROTECT,
        related_name="productos"
    )

    precio_compra = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    precio_venta = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    activo = models.BooleanField(
        default=True
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):
        if not self.codigo:
            while True:
                codigo = str(random.randint(100000000000, 999999999999))

                if not Producto.objects.filter(codigo=codigo).exists():
                    self.codigo = codigo
                    break

        super().save(*args, **kwargs)

    class Meta:
        db_table = "producto"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


# ENTIDAD: INVENTARIO
class Inventario(models.Model):
    producto = models.OneToOneField(
        Producto,
        on_delete=models.PROTECT,
        related_name="inventario"
    )

    cantidad = models.PositiveIntegerField(
        default=0
    )

    stock_minimo = models.PositiveIntegerField(
        default=5
    )

    ubicacion = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "inventario"
        ordering = ["producto"]

    def __str__(self):
        return f"Inventario - {self.producto.nombre}"