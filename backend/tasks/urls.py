from django.urls import path

from tasks.views import (
    AbonosView,
    BankMovementDetailView,
    BankMovementListCreateView,
    CollectionDetailView,
    CollectionListCreateView,
    DevolucionesView,
)

urlpatterns = [
    path("collections/", CollectionListCreateView.as_view(), name="collection-list-create"),
    path("collections/<int:collection_id>/", CollectionDetailView.as_view(), name="collection-detail"),
    path("bank-movements/", BankMovementListCreateView.as_view(), name="bankmovement-list-create"),
    path("bank-movements/<int:bank_movement_id>/", BankMovementDetailView.as_view(), name="bankmovement-detail"),
    path("bank-movements/<int:bank_movement_id>/abonos/", AbonosView.as_view(), name="abonos"),
    path("bank-movements/<int:bank_movement_id>/devoluciones/", DevolucionesView.as_view(), name="devoluciones"),
]
