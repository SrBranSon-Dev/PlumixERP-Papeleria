from django.db import models

class Compra(models.Model):
    fecha = models.DateField()
    proveedor = models.CharField(max_length=100)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Compra {self.id} - {self.proveedor} - {self.fecha}"
