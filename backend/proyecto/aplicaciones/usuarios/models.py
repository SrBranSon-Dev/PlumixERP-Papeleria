from django.contrib.auth.models import AbstractUser
from django.db import models
from .choices import Cargo


class Usuario(AbstractUser):

    documento = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    direccion = models.CharField(max_length=200)

    cargo = models.CharField(
        max_length=20,
        choices=Cargo.choices,
        default=Cargo.CAJERO,
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} - {self.cargo}"