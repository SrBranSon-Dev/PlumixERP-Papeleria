from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views


app_name = "productos"


# Rutas de la API
router = DefaultRouter()

router.register(r"categorias", views.CategoriaViewSet)
router.register(r"productos", views.ProductoViewSet)
router.register(r"inventario", views.InventarioViewSet)


urlpatterns = [
    # Rutas web
    path("", views.lista_productos, name="lista"),
    path("nuevo/", views.crear_producto, name="crear"),
    path("<int:pk>/editar/", views.editar_producto, name="editar"),
    path("<int:pk>/eliminar/", views.eliminar_producto, name="eliminar"),

    # Rutas API
    path("api/", include(router.urls)),
]
