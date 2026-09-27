from rest_framework import serializers
from django.db import transaction

from .models import (
    DetalleFacturaElectronica,
    EventoDian,
    FacturaElectronica,
    ImpuestoFactura,
    ResolucionFacturacion,
)


class ResolucionFacturacionSerializer(serializers.ModelSerializer):

    class Meta:
        model = ResolucionFacturacion
        fields = "__all__"

    def validate(self, attrs):
        instance = ResolucionFacturacion(**attrs)
        instance.full_clean()
        return attrs


class DetalleFacturaElectronicaSerializer(serializers.ModelSerializer):

    class Meta:
        model = DetalleFacturaElectronica
        fields = "__all__"
        read_only_fields = [
            "subtotal",
            "impuesto",
            "total",
        ]


class FacturaElectronicaSerializer(serializers.ModelSerializer):

    class Meta:
        model = FacturaElectronica
        fields = "__all__"
        read_only_fields = [
            "fecha_emision",
            "creada_en",
            "actualizada_en",
            "consecutivo",
            "numero",
            "usuario_creacion",
            "subtotal",
            "descuento",
            "impuesto",
            "total",
        ]

    def create(self, validated_data):
        request = self.context.get("request")

        with transaction.atomic():
            resolucion = (
                ResolucionFacturacion.objects
                .select_for_update()
                .get(pk=validated_data["resolucion"].pk)
            )

            if not resolucion.activa:
                raise serializers.ValidationError(
                    {"resolucion": "La resolución de facturación está inactiva."}
                )

            if resolucion.numero_actual > resolucion.numero_final:
                raise serializers.ValidationError(
                    {"resolucion": "La resolución no tiene consecutivos disponibles."}
                )

            consecutivo = resolucion.numero_actual
            validated_data["consecutivo"] = consecutivo
            validated_data["numero"] = f"{resolucion.prefijo}{consecutivo}"

            if request and getattr(request, "user", None) and request.user.is_authenticated:
                validated_data["usuario_creacion"] = request.user

            resolucion.numero_actual += 1
            factura = FacturaElectronica.objects.create(**validated_data)
            resolucion.save(update_fields=["numero_actual"])

        return factura


class ImpuestoFacturaSerializer(serializers.ModelSerializer):

    class Meta:
        model = ImpuestoFactura
        fields = "__all__"


class EventoDianSerializer(serializers.ModelSerializer):

    class Meta:
        model = EventoDian
        fields = "__all__"
        read_only_fields = ["fecha_evento"]