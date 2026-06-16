import datetime
from decimal import Decimal

import pytest

from tasks import services
from tasks.models import Moneda

pytestmark = pytest.mark.django_db


def test_crear_collection():
    c = services.crear_collection(
        contract_id=123, mes_cobro=datetime.date(2026, 4, 1),
        monto_cobro=Decimal("2"), moneda=Moneda.UF,
    )
    assert c.collection_id is not None


def test_crear_bank_movement():
    m = services.crear_bank_movement(
        fecha=datetime.date(2026, 6, 12), glosa="x",
        monto=Decimal("80000"), pagador="Juan",
    )
    assert m.bank_movement_id is not None


def test_crear_collection_normaliza_mes_cobro_al_dia_1():
    c = services.crear_collection(
        contract_id=123, mes_cobro=datetime.date(2026, 4, 17),
        monto_cobro=Decimal("2"), moneda=Moneda.UF,
    )
    c.refresh_from_db()
    assert c.mes_cobro.day == 1


from tasks import selectors
from tasks.exceptions import AbonoExcedeFaltante, SaldoInsuficiente
from tasks.models import Abono


def _cobro(monto, moneda=Moneda.CLP):
    return services.crear_collection(
        contract_id=1, mes_cobro=datetime.date(2026, 4, 1),
        monto_cobro=Decimal(monto), moneda=moneda,
    )


def _mov(monto):
    return services.crear_bank_movement(
        fecha=datetime.date(2026, 4, 2), glosa="", monto=Decimal(monto), pagador="X",
    )


def test_reconciliar_paga_un_cobro_completo():
    c = _cobro("50000")
    m = _mov("50000")
    services.reconciliar(bank_movement_id=m.pk,
                         asignaciones=[{"collection_id": c.pk, "monto": Decimal("50000")}])
    assert selectors.estado(c) == "pagado"
    assert selectors.saldo_disponible(m) == Decimal("0")


def test_reconciliar_reparte_en_dos_cobros_y_deja_saldo():
    c1 = _cobro("50000")
    c2 = _cobro("20000")
    m = _mov("80000")
    services.reconciliar(bank_movement_id=m.pk, asignaciones=[
        {"collection_id": c1.pk, "monto": Decimal("50000")},
        {"collection_id": c2.pk, "monto": Decimal("20000")},
    ])
    assert selectors.estado(c1) == "pagado"
    assert selectors.estado(c2) == "pagado"
    assert selectors.saldo_disponible(m) == Decimal("10000")  # saldo a favor


def test_reconciliar_rechaza_abono_mayor_al_faltante():
    c = _cobro("50000")
    m = _mov("80000")
    with pytest.raises(AbonoExcedeFaltante):
        services.reconciliar(bank_movement_id=m.pk,
                             asignaciones=[{"collection_id": c.pk, "monto": Decimal("60000")}])
    assert Abono.objects.count() == 0  # rollback total


def test_reconciliar_rechaza_si_excede_saldo_del_movimiento():
    c1 = _cobro("50000")
    c2 = _cobro("50000")
    m = _mov("80000")
    with pytest.raises(SaldoInsuficiente):
        services.reconciliar(bank_movement_id=m.pk, asignaciones=[
            {"collection_id": c1.pk, "monto": Decimal("50000")},
            {"collection_id": c2.pk, "monto": Decimal("50000")},
        ])
    assert Abono.objects.count() == 0  # rollback total


def test_devolver_descuenta_del_saldo():
    m = _mov("80000")
    services.devolver(bank_movement_id=m.pk, monto=Decimal("30000"),
                      motivo="sobrepago", fecha=datetime.date(2026, 4, 5))
    assert selectors.saldo_disponible(m) == Decimal("50000")


def test_devolver_rechaza_si_excede_saldo():
    m = _mov("80000")
    with pytest.raises(SaldoInsuficiente):
        services.devolver(bank_movement_id=m.pk, monto=Decimal("90000"),
                          motivo="", fecha=datetime.date(2026, 4, 5))
