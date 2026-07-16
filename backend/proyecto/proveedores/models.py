from django.db import models

class Proveedor(models.Model):
    nit = models.CharField(max_length=20, unique=True)
    nombre_empresa = models.CharField(max_length=100)
    nombre_contacto = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20)
    correo = models.EmailField()
    direccion = models.CharField(max_length=200)
    ciudad = models.CharField(max_length=100)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre_empresa
    