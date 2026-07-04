from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from aplicaciones.usuarios.models import Usuario


class UsuarioAdmin(UserAdmin):
    model = Usuario

    fieldsets = UserAdmin.fieldsets + (
        ("Información adicional", {
            "fields": ("documento", "telefono", "direccion", "cargo")
        }),
    )

admin.site.register(Usuario, UsuarioAdmin)