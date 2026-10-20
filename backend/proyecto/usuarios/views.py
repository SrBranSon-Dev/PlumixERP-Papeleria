from django.shortcuts import render, get_object_or_404
from django.utils import timezone


# Configuración del correo electrónico
from django.conf import settings

# Generación y validación de tokens seguros para recuperar contraseñas
from django.contrib.auth.tokens import default_token_generator

# Envío de correos electrónicos desde Django
from django.core.mail import send_mail
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password

# Conversión del identificador del usuario a una codificación segura
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


# Decodificar el identificador recibido en el enlace de recuperación
from django.utils.http import urlsafe_base64_decode

# Convertir el identificador decodificado a texto
from django.utils.encoding import force_str



from django.db import models  # Añadida para capturar el ProtectedError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, generics, serializers as drf_serializers
from rest_framework.exceptions import ValidationError

# Importaciones internas
from .serializers import RegistroUsuarioSerializer, PerfilUsuarioSerializer
from .permissions import EsAdministrador
from .models import AuditoriaLog, UsuarioPersonalizado, ControlCaja
from .utils import registrar_log

# ==========================================
# 1. GESTIÓN Y REGISTRO DE USUARIOS
# ==========================================

class RegistroUsuarioView(APIView):
    permission_classes = [EsAdministrador] 

    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        if serializer.is_valid():
            usuario_creado = serializer.save()
            
            # REGISTRO EN AUDITORÍA
            registrar_log(
                request=request,
                accion="REGISTRO_EMPLEADO",
                descripcion=f"El administrador creó al usuario '{usuario_creado.username}' con el rol de {usuario_creado.rol_actual}."
            )
            
            return Response(
                {"mensaje": "Usuario creado exitosamente por el administrador", "usuario": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PerfilUsuarioView(APIView):
    def get(self, request):
        serializer = PerfilUsuarioSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CambiarPasswordView(APIView):
    """
    Permite al usuario autenticado cambiar su propia contraseña.
    Requiere la contraseña actual y una nueva contraseña.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        password_actual = request.data.get("password_actual", "")
        nueva_password = request.data.get("nueva_password", "")
        confirmar_password = request.data.get("confirmar_password", "")

        # Verificar que todos los campos estén completos
        if not password_actual or not nueva_password or not confirmar_password:
            return Response(
                {"mensaje": "Debes completar todos los campos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar la contraseña actual
        if not request.user.check_password(password_actual):
            return Response(
                {"mensaje": "La contraseña actual es incorrecta."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar que las nuevas contraseñas coincidan
        if nueva_password != confirmar_password:
            return Response(
                {"mensaje": "Las nuevas contraseñas no coinciden."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Evitar reutilizar la contraseña actual
        if password_actual == nueva_password:
            return Response(
                {"mensaje": "La nueva contraseña debe ser diferente a la actual."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar seguridad de la nueva contraseña
        try:
            validate_password(nueva_password, user=request.user)
        except DjangoValidationError as error:
            return Response(
                {"mensaje": error.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guardar la nueva contraseña de forma segura
        request.user.set_password(nueva_password)
        request.user.save(update_fields=["password"])

        return Response(
            {"mensaje": "Contraseña cambiada correctamente."},
            status=status.HTTP_200_OK
        )    


class GestionEstadoEmpleadoView(APIView):
    """
    Permite al dueño activar o desactivar la cuenta de un empleado (Bajas lógicas).
    """
    permission_classes = [EsAdministrador]

    def patch(self, request, usuario_id):
        empleado = get_object_or_404(UsuarioPersonalizado, id=usuario_id)
        
        if empleado == request.user:
            return Response(
                {"error": "No puedes desactivar tu propia cuenta de administrador."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        nuevo_estado = request.data.get("is_active")
        if nuevo_estado is None:
            return Response(
                {"error": "Debes proporcionar el campo 'is_active' (true o false)."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        empleado.is_active = bool(nuevo_estado)
        empleado.save()
        
        # REGISTRO EN AUDITORÍA
        accion_log = "ALTA_EMPLEADO" if empleado.is_active else "BAJA_EMPLEADO"
        motivo = "activó" if empleado.is_active else "desactivó"
        registrar_log(
            request=request,
            accion=accion_log,
            descripcion=f"El administrador {motivo} el acceso al sistema para el usuario '{empleado.username}'."
        )
        
        status_text = "activado" if empleado.is_active else "desactivado (dado de baja)"
        return Response(
            {"mensaje": f"El usuario '{empleado.username}' ha sido {status_text} exitosamente."},
            status=status.HTTP_200_OK
        )
        
# ==========================================
# COMPLEMENTOS PARA EL CRUD DE ADMINISTRADOR
# ==========================================

class ListarEmpleadosView(generics.ListAPIView):
    """
    Devuelve la lista completa de empleados registrados para la tabla del Administrador.
    """
    serializer_class = PerfilUsuarioSerializer
    permission_classes = [EsAdministrador]

    def get_queryset(self):
        return UsuarioPersonalizado.objects.filter(is_superuser=False)


class ActualizarEmpleadoView(APIView):
    """
    Permite al administrador modificar los datos básicos de un empleado específico.
    """
    permission_classes = [EsAdministrador]

    def put(self, request, usuario_id):
        empleado = get_object_or_404(UsuarioPersonalizado, id=usuario_id)
        serializer = PerfilUsuarioSerializer(empleado, data=request.data, partial=True)
        
        if serializer.is_valid():
            usuario_actualizado = serializer.save()
            
            nueva_password = request.data.get("password")
            if nueva_password:
                usuario_actualizado.set_password(nueva_password)
                usuario_actualizado.save()

            # REGISTRO EN AUDITORÍA
            registrar_log(
                request=request,
                accion="EDICION_EMPLEADO",
                descripcion=f"El administrador modificó los datos del usuario '{usuario_actualizado.username}'."
            )
            
            return Response(
                {"mensaje": "Datos del empleado actualizados con éxito", "usuario": serializer.data},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EliminarEmpleadoDefinitivoView(APIView):
    """
    Elimina físicamente a un empleado de la base de datos para siempre.
    """
    permission_classes = [EsAdministrador]

    def delete(self, request, usuario_id):
        empleado = get_object_or_404(UsuarioPersonalizado, id=usuario_id)
        
        if empleado == request.user:
            return Response(
                {"error": "No puedes eliminar tu propia cuenta de administrador."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        nombre_usuario = empleado.username
        
        try:
            empleado.delete()
            
            #  REGISTRO EN AUDITORÍA
            registrar_log(
                request=request,
                accion="ELIMINACION_DEFINITIVA_EMPLEADO",
                descripcion=f"El administrador eliminó permanentemente del sistema al usuario '{nombre_usuario}'."
            )
            
            return Response(
                {"mensaje": f"El usuario '{nombre_usuario}' ha sido eliminado para siempre del sistema."},
                status=status.HTTP_200_OK
            )
        except models.ProtectedError:
            # Captura si el empleado ya abrió cajas o logs vinculados con PROTECT
            return Response(
                {"error": "No se puede borrar para siempre. Este empleado ya tiene un historial de turnos de caja o transacciones registradas. Utiliza 'Dar de Baja' en su lugar."}, 
                status=status.HTTP_400_BAD_REQUEST
            )


# ==========================================
# 2. SISTEMA DE AUDITORÍA (LOGS)
# ==========================================

class AuditoriaLogSerializer(drf_serializers.ModelSerializer):
    usuario_nombre = drf_serializers.ReadOnlyField(source='usuario.username')
    
    class Meta:
        model = AuditoriaLog
        fields = ('id', 'usuario_nombre', 'accion', 'descripcion', 'ip_direccion', 'fecha_hora')


class ListarAuditoriaLogsView(generics.ListAPIView):
    """
    Devuelve la lista completa de acciones del ERP para el Dueño.
    """
    queryset = AuditoriaLog.objects.all()
    serializer_class = AuditoriaLogSerializer
    permission_classes = [EsAdministrador]


# ==========================================
# 3. CONTROL DE FLUJO DE CAJA (TURNOS)
# ==========================================

class AperturaCajaSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = ControlCaja
        fields = ('monto_inicial', 'observaciones')


class CierreCajaSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = ControlCaja
        fields = ('monto_final_real', 'observaciones')


class AperturaCajaView(APIView):
    def post(self, request):
        if ControlCaja.objects.filter(empleado=request.user, abierta=True).exists():
            raise ValidationError({"error": "Ya tienes un turno de caja activo y abierto."})

        serializer = AperturaCajaSerializer(data=request.data)
        if serializer.is_valid():
            caja = serializer.save(empleado=request.user)
            
            # Auditoría automática
            registrar_log(request, "APERTURA_CAJA", f"El empleado abrió turno con un fondo de ${caja.monto_inicial}")
            
            return Response({"mensaje": "Caja abierta con éxito, ¡buen turno!", "id_caja": caja.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CierreCajaView(APIView):
    def post(self, request):
        try:
            caja_activa = ControlCaja.objects.get(empleado=request.user, abierta=True)
        except ControlCaja.DoesNotExist:
            raise ValidationError({"error": "No tienes ninguna caja abierta para poder cerrar."})

        serializer = CierreCajaSerializer(data=request.data)
        if serializer.is_valid():
            total_ventas_del_turno = 0.00 
            
            caja_activa.monto_final_calculado = caja_activa.monto_inicial + timezone.decimal.Decimal(total_ventas_del_turno)
            caja_activa.monto_final_real = serializer.validated_data['monto_final_real']
            caja_activa.observaciones = serializer.validated_data.get('observaciones', '')
            caja_activa.fecha_cierre = timezone.now()
            caja_activa.abierta = False
            caja_activa.save()

            # COMPLETADO: Registro final del log de cierre de caja que faltaba
            registrar_log(
                request, 
                "CIERRE_CAJA", 
                f"Cierre de caja. Sistema: ${caja_activa.monto_final_calculado} | Real: ${caja_activa.monto_final_real} | Descuadre: ${caja_activa.descuadre}"
            )

            return Response({
                "mensaje": "Caja cerrada correctamente.",
                "sistema_calculo": caja_activa.monto_final_calculado,
                "entregado_fisico": caja_activa.monto_final_real,
                "descuadre": caja_activa.descuadre
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
# ==========================================
# 4. RECUPERACIÓN DE CONTRASEÑA
# ==========================================

class SolicitarRecuperacionPasswordView(APIView):
    """
    Recibe el correo del usuario y genera un enlace
    temporal para recuperar su contraseña.
    """

    # Permite solicitar la recuperación sin iniciar sesión
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        # Obtener el correo enviado desde el formulario
        email = request.data.get("email", "").strip()

        # Validar que se haya ingresado un correo
        if not email:
            return Response(
                {"mensaje": "Debes ingresar tu correo electrónico."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar usuarios activos con ese correo
        usuarios = UsuarioPersonalizado.objects.filter(
            email__iexact=email,
            is_active=True
        )

        # Generar el enlace solo si existe una cuenta
        if usuarios.exists():
            for usuario in usuarios:
                # Codificar el identificador del usuario
                uid = urlsafe_base64_encode(force_bytes(usuario.pk))

                # Generar un token de recuperación
                token = default_token_generator.make_token(usuario)

                # Crear el enlace para las pruebas locales
                enlace = (
                    f"http://localhost:5173/restablecer/{uid}/{token}"
                )

                # Enviar el correo; en modo de prueba
                # aparecerá en la terminal de Django
                send_mail(
                    subject="Recuperación de contraseña - PlumixERP",
                    message=(
                        f"Hola {usuario.username},\n\n"
                        "Solicitaste recuperar tu contraseña.\n"
                        f"Enlace de recuperación: {enlace}\n\n"
                        "Si no solicitaste este cambio, "
                        "ignora este mensaje."
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[usuario.email],
                    fail_silently=False,
                )

        # No revelar si el correo está registrado
        return Response(
            {
                "mensaje": (
                    "Si el correo está registrado, recibirás "
                    "instrucciones para recuperar tu contraseña."
                )
            },
            status=status.HTTP_200_OK
        )



# ==========================================
# 5. RESTABLECER CONTRASEÑA
# ==========================================

class RestablecerPasswordView(APIView): 
    """
    Valida el enlace de recuperación y permite
    establecer una contraseña nueva.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        # Obtener los datos enviados
        uid = request.data.get("uid", "")
        token = request.data.get("token", "")
        nueva_password = request.data.get("password", "")

        # Verificar que se hayan enviado todos los campos
        if not uid or not token or not nueva_password:
            return Response(
                {"mensaje": "Debes proporcionar el enlace y la nueva contraseña."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Decodificar el identificador del usuario
            usuario_id = force_str(urlsafe_base64_decode(uid))

            # Buscar la cuenta correspondiente
            usuario = UsuarioPersonalizado.objects.get(
                pk=usuario_id,
                is_active=True
            )
        except (
            ValueError,
            TypeError,
            OverflowError,
            UsuarioPersonalizado.DoesNotExist
        ):
            return Response(
                {"mensaje": "El enlace de recuperación no es válido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Comprobar que el token sea válido y no haya sido invalidado
        if not default_token_generator.check_token(usuario, token):
            return Response(
                {"mensaje": "El enlace expiró o ya no es válido. Solicita uno nuevo."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guardar la contraseña utilizando el mecanismo seguro de Django
        usuario.set_password(nueva_password)
        usuario.save(update_fields=["password"])

        return Response(
            {"mensaje": "Tu contraseña se ha restablecido correctamente."},
            status=status.HTTP_200_OK
        )
