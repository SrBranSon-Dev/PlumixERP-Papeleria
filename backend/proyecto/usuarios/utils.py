from .models import AuditoriaLog

def registrar_log(request, accion, descripcion):
    """
    Función auxiliar para registrar una acción en el sistema de auditoría.
    Soporta peticiones donde el usuario podría no estar autenticado (ej. fallos de login).
    """
    usuario = request.user if request.user.is_authenticated else None
    
    # Obtiene la IP del cliente de forma segura
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    AuditoriaLog.objects.create(
        usuario=usuario,
        accion=accion,
        descripcion=descripcion,
        ip_direccion=ip
    )
