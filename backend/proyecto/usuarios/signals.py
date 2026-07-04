from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import Group

@receiver(post_migrate)
def crear_roles_papeleria(sender, **kwargs):
    if sender.name == 'usuarios':
        # El Administrador se maneja con flags nativos (is_staff/is_superuser).
        # Para el personal del mostrador usaremos solo este grupo:
        Group.objects.get_or_create(name='Empleado')
