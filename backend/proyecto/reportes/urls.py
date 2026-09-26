from django.urls import path

from .views import ReporteVentasView


urlpatterns = [
    path("ventas/", ReporteVentasView.as_view(), name="reporte-ventas"),
]