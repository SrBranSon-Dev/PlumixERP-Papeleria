from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ventas.models import Venta


class ReporteVentasView(APIView):

    def get(self, request):

        # Consulta inicial
        ventas = Venta.objects.select_related("cliente").all()

        # ============================
        # FILTROS
        # ============================

        fecha_inicio = request.GET.get("fecha_inicio")
        fecha_fin = request.GET.get("fecha_fin")
        cliente = request.GET.get("cliente")
        medio_pago = request.GET.get("medio_pago")

        # Filtro por fecha inicial
        if fecha_inicio:
            ventas = ventas.filter(fecha__date__gte=fecha_inicio)

        # Filtro por fecha final
        if fecha_fin:
            ventas = ventas.filter(fecha__date__lte=fecha_fin)

        # Filtro por cliente
        if cliente:
            ventas = ventas.filter(
                cliente__nombre__icontains=cliente
            )

        # Filtro por medio de pago
        if medio_pago:
            ventas = ventas.filter(
                medio_pago=medio_pago
            )

        # Ordenar las ventas
        ventas = ventas.order_by("-fecha")

        # ============================
        # LISTA DE VENTAS
        # ============================

        resultado = []

        for venta in ventas:
            resultado.append({
                "id": venta.id,
                "cliente": venta.cliente.nombre,
                "fecha": venta.fecha,
                "medio_pago": venta.medio_pago,
                "subtotal": venta.subtotal,
                "iva": venta.iva,
                "total": venta.total,
            })

        # ============================
        # RESUMEN
        # ============================

        total_ventas = ventas.count()

        total_subtotal = sum(
            venta.subtotal for venta in ventas
        )

        total_iva = sum(
            venta.iva for venta in ventas
        )

        total_vendido = sum(
            venta.total for venta in ventas
        )

        return Response({

            "resumen": {
                "cantidad_ventas": total_ventas,
                "subtotal": total_subtotal,
                "iva": total_iva,
                "total_vendido": total_vendido,
            },

            "ventas": resultado,

        }, status=status.HTTP_200_OK)