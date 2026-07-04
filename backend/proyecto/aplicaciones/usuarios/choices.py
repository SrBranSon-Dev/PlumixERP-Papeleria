from django.db import models


class Cargo(models.TextChoices):
    ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
    GERENTE = "GERENTE", "Gerente"
    VENTAS = "VENTAS", "Ventas"
    COMPRAS = "COMPRAS", "Compras"
    INVENTARIO = "INVENTARIO", "Inventario"
    CAJERO = "CAJERO", "Cajero"