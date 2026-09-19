from django.db import models
from productos.models import Producto

class MovimientoInventario(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    tipo_movimiento = models.CharField(max_length=10, choices=[('entrada', 'Entrada'), ('salida', 'Salida')])

    def __str__(self):
        return f"{self.tipo_movimiento} - {self.producto.nombre} - {self.cantidad}"