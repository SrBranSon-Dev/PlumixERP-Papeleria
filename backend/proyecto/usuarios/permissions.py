from rest_framework import permissions

class EsAdministrador(permissions.BasePermission):
    """
    Permite el acceso solo al dueño (Superusuarios o Staff de Django).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff))

class EsEmpleado(permissions.BasePermission):
    """
    Permite el acceso a los trabajadores de la papelería asignados al grupo 'Empleado'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.groups.filter(name='Empleado').exists())
