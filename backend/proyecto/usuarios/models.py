from django.contrib.auth.models import AbstractUser
from django.db import models

class UsuarioPersonalizado(AbstractUser):
    # Campo adicional útil para el contacto del personal de la papelería
    telefono = models.CharField(max_length=20, blank=True, null=True)
    
    @property
    def rol_actual(self):
        """
        Determina dinámicamente si el usuario es el Dueño o un Empleado.
        Esto evita usar banderas manuales propensas a errores.
        """
        if self.is_superuser or self.is_staff:
            return "Administrador (Dueño)"
        if self.groups.filter(name='Empleado').exists():
            return "Empleado"
        return "Sin Rol Asignado"

    def __str__(self):
        return f"{self.username} - {self.rol_actual}"


class AuditoriaLog(models.Model):
    # Vincula la acción con el empleado que la realizó
    usuario = models.ForeignKey(UsuarioPersonalizado, on_delete=models.SET_NULL, null=True, related_name='logs')
    accion = models.CharField(max_length=100) # Ej: "INICIO_SESION", "MODIFICAR_STOCK", "CREAR_USUARIO"
    descripcion = models.TextField() # Detalles de la acción
    ip_direccion = models.GenericIPAddressField(blank=True, null=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_hora'] # Los registros más recientes aparecen primero

    def __str__(self):
        return f"{self.fecha_hora} | {self.usuario} -> {self.accion}"


class ControlCaja(models.Model):
    # Vincula la caja a un empleado en específico
    empleado = models.ForeignKey(UsuarioPersonalizado, on_delete=models.PROTECT, related_name='turnos_caja')
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(blank=True, null=True)
    
    # Valores monetarios
    monto_inicial = models.DecimalField(max_digits=10, decimal_places=2) # Con cuánto inicia el cambio
    monto_final_calculado = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Lo que el sistema calcula (Ventas + Inicial)
    monto_final_real = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True) # Lo que el empleado cuenta físicamente
    
    # Estado del turno
    abierta = models.BooleanField(default=True)
    observaciones = models.TextField(blank=True, null=True)

    @property
    def descuadre(self):
        """Calcula la diferencia si falta o sobra dinero al cerrar."""
        if self.monto_final_real is not None:
            return self.monto_final_real - self.monto_final_calculado
        return 0.00

    def __str__(self):
        estado = "Abierta" if self.abierta else "Cerrada"
        return f"Caja de {self.empleado.username} - {estado} ({self.fecha_apertura.date()})"
