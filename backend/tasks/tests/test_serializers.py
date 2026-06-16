import datetime
from decimal import Decimal

import pytest

from tasks import services
from tasks.models import Moneda
from tasks.serializers import (
    CollectionSerializer,
    DevolverSerializer,
    ReconciliarSerializer,
)

pytestmark = pytest.mark.django_db


def test_collection_serializer_expone_derivados_en_clp():
    c = services.crear_collection(
        contract_id=1, mes_cobro=datetime.date(2026, 4, 1),
        monto_cobro=Decimal("2"), moneda=Moneda.UF,
    )
    data = CollectionSerializer(c).data
    assert data["moneda"] == "UF"
    assert data["equivalente_clp"] == "80000.00"
    assert data["faltante_clp"] == "80000.00"
    assert data["estado"] == "pendiente"


def test_reconciliar_serializer_rechaza_asignaciones_vacias():
    serializer = ReconciliarSerializer(data={"asignaciones": []})
    assert serializer.is_valid() is False


def test_reconciliar_serializer_rechaza_monto_cero():
    serializer = ReconciliarSerializer(
        data={"asignaciones": [{"collection_id": 1, "monto": "0"}]}
    )
    assert serializer.is_valid() is False


def test_devolver_serializer_rechaza_monto_cero():
    serializer = DevolverSerializer(
        data={"monto": "0", "fecha": "2026-04-01"}
    )
    assert serializer.is_valid() is False
