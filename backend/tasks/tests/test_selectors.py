import datetime
from decimal import Decimal

import pytest

from tasks import selectors
from tasks.models import Abono, BankMovement, Collection, Devolucion, Moneda

pytestmark = pytest.mark.django_db


# ── Task 5: equivalente_clp ───────────────────────────────────────────────────


def test_equivalente_clp_uf_multiplica_por_40000():
    assert selectors.equivalente_clp(Decimal("2"), Moneda.UF) == Decimal("80000")


def test_equivalente_clp_clp_no_cambia():
    assert selectors.equivalente_clp(Decimal("50000"), Moneda.CLP) == Decimal("50000")


# ── Task 6: abonado_clp, faltante_clp, estado, saldo_disponible ──────────────


def _cobro(monto, moneda, contract_id=1):
    return Collection.objects.create(
        contract_id=contract_id, mes_cobro=datetime.date(2026, 4, 1),
        monto_cobro=Decimal(monto), moneda=moneda,
    )


def _mov(monto, fecha=datetime.date(2026, 4, 2)):
    return BankMovement.objects.create(
        fecha=fecha, glosa="", monto=Decimal(monto), pagador="X",
    )


def test_estado_pendiente_sin_abonos():
    c = _cobro("50000", Moneda.CLP)
    assert selectors.estado(c) == "pendiente"
    assert selectors.faltante_clp(c) == Decimal("50000")


def test_estado_parcial_uf():
    # Cobro UF 2 (= $80.000). Abono $40.000 -> parcial, faltan $40.000.
    c = _cobro("2", Moneda.UF)
    m = _mov("40000")
    Abono.objects.create(bank_movement=m, collection=c, monto=Decimal("40000"))
    assert selectors.estado(c) == "parcial"
    assert selectors.faltante_clp(c) == Decimal("40000")


def test_estado_pagado_uf_exacto():
    c = _cobro("2", Moneda.UF)
    m = _mov("80000")
    Abono.objects.create(bank_movement=m, collection=c, monto=Decimal("80000"))
    assert selectors.estado(c) == "pagado"
    assert selectors.faltante_clp(c) == Decimal("0")


def test_saldo_disponible_descuenta_abonos_y_devoluciones():
    m = _mov("80000")
    c = _cobro("50000", Moneda.CLP)
    Abono.objects.create(bank_movement=m, collection=c, monto=Decimal("50000"))
    Devolucion.objects.create(
        bank_movement=m, monto=Decimal("10000"),
        fecha=datetime.date(2026, 4, 5), motivo="",
    )
    assert selectors.saldo_disponible(m) == Decimal("20000")


# ── Task 11: listar_collections, listar_bank_movements ───────────────────────


def test_listar_collections_filtra_por_estado():
    pagado = _cobro("50000", Moneda.CLP)
    m = _mov("50000")
    Abono.objects.create(bank_movement=m, collection=pagado, monto=Decimal("50000"))
    _cobro("30000", Moneda.CLP)  # pendiente

    res = selectors.listar_collections(estado_filtro="pagado")
    assert [c.pk for c in res] == [pagado.pk]


def test_listar_bank_movements_ordenados_por_fecha():
    m1 = _mov("10000", fecha=datetime.date(2026, 1, 1))
    m2 = _mov("20000", fecha=datetime.date(2026, 6, 1))

    res = selectors.listar_bank_movements()
    pks = [m.pk for m in res]
    assert pks.index(m2.pk) < pks.index(m1.pk), "El más reciente debe aparecer primero"


def test_listar_collections_filtra_por_contract_id():
    c1 = _cobro("10000", Moneda.CLP, contract_id=42)
    _cobro("20000", Moneda.CLP, contract_id=99)

    res = selectors.listar_collections(contract_id=42)
    assert [c.pk for c in res] == [c1.pk]


def test_listar_collections_filtra_por_moneda():
    c_clp = _cobro("10000", Moneda.CLP)
    _cobro("1", Moneda.UF)

    res = selectors.listar_collections(moneda=Moneda.CLP)
    assert all(c.moneda == Moneda.CLP for c in res)
    assert any(c.pk == c_clp.pk for c in res)
    assert all(c.moneda != Moneda.UF for c in res)
