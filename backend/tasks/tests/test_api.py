import datetime
from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from tasks import services
from tasks.models import Moneda

pytestmark = pytest.mark.django_db


@pytest.fixture
def api():
    return APIClient()


def test_crear_y_listar_collection(api):
    r = api.post("/api/collections/", {
        "contract_id": 123, "mes_cobro": "2026-04-01",
        "monto_cobro": "2", "moneda": "UF",
    }, format="json")
    assert r.status_code == 201

    r = api.get("/api/collections/")
    assert r.status_code == 200
    assert r.data["count"] == 1


def test_conciliar_endpoint(api):
    c = services.crear_collection(contract_id=1, mes_cobro=datetime.date(2026, 4, 1),
                                  monto_cobro=Decimal("50000"), moneda=Moneda.CLP)
    m = services.crear_bank_movement(fecha=datetime.date(2026, 4, 2), glosa="",
                                     monto=Decimal("80000"), pagador="Juan")
    r = api.post(f"/api/bank-movements/{m.pk}/abonos/", {
        "asignaciones": [{"collection_id": c.pk, "monto": "50000"}],
    }, format="json")
    assert r.status_code == 201

    r = api.get(f"/api/collections/{c.pk}/")
    assert r.data["estado"] == "pagado"
    assert len(r.data["abonos"]) == 1


def test_conciliar_sobre_saldo_devuelve_error_uniforme(api):
    c = services.crear_collection(contract_id=1, mes_cobro=datetime.date(2026, 4, 1),
                                  monto_cobro=Decimal("90000"), moneda=Moneda.CLP)
    m = services.crear_bank_movement(fecha=datetime.date(2026, 4, 2), glosa="",
                                     monto=Decimal("50000"), pagador="Juan")
    r = api.post(f"/api/bank-movements/{m.pk}/abonos/", {
        "asignaciones": [{"collection_id": c.pk, "monto": "60000"}],
    }, format="json")
    assert r.status_code == 409
    assert r.data["error"]["code"] == "saldo_insuficiente"


def test_get_collection_inexistente_devuelve_404(api):
    r = api.get("/api/collections/999999/")
    assert r.status_code == 404


def test_abonos_sobre_movimiento_inexistente_devuelve_404(api):
    c = services.crear_collection(contract_id=1, mes_cobro=datetime.date(2026, 4, 1),
                                  monto_cobro=Decimal("50000"), moneda=Moneda.CLP)
    r = api.post("/api/bank-movements/999999/abonos/", {
        "asignaciones": [{"collection_id": c.pk, "monto": "50000"}],
    }, format="json")
    assert r.status_code == 404


def test_crear_collection_monto_no_positivo_devuelve_400(api):
    r = api.post("/api/collections/", {
        "contract_id": 123, "mes_cobro": "2026-04-01",
        "monto_cobro": "-5", "moneda": "UF",
    }, format="json")
    assert r.status_code == 400


def test_crear_bank_movement_monto_no_positivo_devuelve_400(api):
    r = api.post("/api/bank-movements/", {
        "fecha": "2026-04-02", "monto": "-5",
    }, format="json")
    assert r.status_code == 400


def test_crear_bank_movement_solo_fecha_y_monto_devuelve_201(api):
    r = api.post("/api/bank-movements/", {
        "fecha": "2026-04-02", "monto": "80000",
    }, format="json")
    assert r.status_code == 201


def test_abonos_sobre_cobro_inexistente_devuelve_404(api):
    m = services.crear_bank_movement(fecha=datetime.date(2026, 4, 2),
                                     monto=Decimal("80000"))
    r = api.post(f"/api/bank-movements/{m.pk}/abonos/", {
        "asignaciones": [{"collection_id": 999999, "monto": "50000"}],
    }, format="json")
    assert r.status_code == 404
    assert r.data["error"]["code"] == "cobro_no_encontrado"
