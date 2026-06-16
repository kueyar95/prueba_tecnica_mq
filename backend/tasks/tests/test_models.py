import datetime
from decimal import Decimal

import pytest

from tasks.models import Collection, Moneda

pytestmark = pytest.mark.django_db


def test_collection_se_crea_con_campos_minimos():
    c = Collection.objects.create(
        contract_id=123,
        mes_cobro=datetime.date(2026, 4, 1),
        monto_cobro=Decimal("2"),
        moneda=Moneda.UF,
    )
    assert c.collection_id is not None
    assert c.moneda == "UF"


def test_bank_movement_se_crea_en_clp():
    from tasks.models import BankMovement

    m = BankMovement.objects.create(
        fecha=datetime.date(2026, 6, 12),
        glosa="arriendo abril",
        monto=Decimal("80000"),
        pagador="Juan Pérez",
    )
    assert m.bank_movement_id is not None
    assert m.monto == Decimal("80000")


def test_abono_enlaza_movimiento_y_cobro():
    from tasks.models import Abono, BankMovement

    c = Collection.objects.create(
        contract_id=1, mes_cobro=datetime.date(2026, 4, 1),
        monto_cobro=Decimal("50000"), moneda=Moneda.CLP,
    )
    m = BankMovement.objects.create(
        fecha=datetime.date(2026, 4, 2), glosa="", monto=Decimal("50000"), pagador="X",
    )
    a = Abono.objects.create(bank_movement=m, collection=c, monto=Decimal("50000"))
    assert a.abono_id is not None
    assert c.abonos.count() == 1
    assert m.abonos.count() == 1


def test_devolucion_enlaza_movimiento():
    from tasks.models import Devolucion, BankMovement

    m = BankMovement.objects.create(
        fecha=datetime.date(2026, 4, 2), glosa="", monto=Decimal("80000"), pagador="X",
    )
    d = Devolucion.objects.create(
        bank_movement=m, monto=Decimal("30000"),
        fecha=datetime.date(2026, 4, 5), motivo="sobrepago",
    )
    assert d.devolucion_id is not None
    assert m.devoluciones.count() == 1
