from django.urls import path
from .views import (
    RegistroUsuarioView, 
    PerfilUsuarioView, 
    ListarAuditoriaLogsView, 
    AperturaCajaView, 
    CierreCajaView, 
    GestionEstadoEmpleadoView,
    # Nuevas importaciones para completar el CRUD:
    ListarEmpleadosView,
    ActualizarEmpleadoView,
    EliminarEmpleadoDefinitivoView
)

urlpatterns = [
    # Gestión de Sesión y Perfil
    path('registro/', RegistroUsuarioView.as_view(), name='api_registro'),
    path('perfil/', PerfilUsuarioView.as_view(), name='api_perfil'),
    
    # Completando el CRUD de Empleados para el Administrador
    path('empleados/listar/', ListarEmpleadosView.as_view(), name='api_listar_empleados'),
    path('empleados/<int:usuario_id>/actualizar/', ActualizarEmpleadoView.as_view(), name='api_actualizar_empleado'),
    path('empleados/<int:usuario_id>/estado/', GestionEstadoEmpleadoView.as_view(), name='api_gestion_estado'),
    path('empleados/<int:usuario_id>/eliminar/', EliminarEmpleadoDefinitivoView.as_view(), name='api_eliminar_empleado'),
    
    # Sistema de Auditoría
    path('auditoria/', ListarAuditoriaLogsView.as_view(), name='api_auditoria'),
    
    # Control de Caja (Turnos)
    path('caja/apertura/', AperturaCajaView.as_view(), name='api_caja_apertura'),
    path('caja/cierre/', CierreCajaView.as_view(), name='api_caja_cierre'),
]
