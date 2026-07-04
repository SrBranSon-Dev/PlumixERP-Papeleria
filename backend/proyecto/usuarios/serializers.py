from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import UsuarioPersonalizado

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    es_admin = serializers.BooleanField(write_only=True, default=False) # True = Dueño, False = Empleado

    class Meta:
        model = UsuarioPersonalizado
        fields = ('id', 'username', 'email', 'password', 'telefono', 'es_admin')

    def create(self, validated_data):
        es_admin = validated_data.pop('es_admin')
        
        # Creamos el usuario configurando los accesos nativos de Django
        user = UsuarioPersonalizado.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            telefono=validated_data.get('telefono', ''),
            is_staff=es_admin,       # Da acceso a herramientas de gestión
            is_superuser=es_admin    # Le otorga todos los permisos del sistema
        )
        
        # Si no es el dueño, se le asigna automáticamente el grupo de Empleado
        if not es_admin:
            grupo_empleado, _ = Group.objects.get_or_create(name='Empleado')
            user.groups.add(grupo_empleado)
        
        return user


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    # Mostramos el rol como texto en lugar de un booleano
    rol = serializers.ReadOnlyField(source='rol_actual')
    # Añadimos es_admin como campo de lectura para saber si es superusuario en el frontend
    es_admin = serializers.BooleanField(source='is_superuser', read_only=True)

    class Meta:
        model = UsuarioPersonalizado
        fields = ('id', 'username', 'email', 'telefono', 'rol', 'is_active', 'es_admin')

    def update(self, instance, validated_data):
        """
        Permite al administrador modificar los datos de un empleado existente desde React.
        """
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.telefono = validated_data.get('telefono', instance.telefono)
        
        # Guardamos los cambios básicos
        instance.save()
        return instance
