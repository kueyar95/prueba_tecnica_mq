import datetime
from decimal import Decimal

from django.db import transaction

from . import selectors
from .exceptions import (
    AbonoExcedeFaltante,
    CobroNoEncontrado,
    MontoInvalido,
    SaldoInsuficiente,
)
from .models import Abono, BankMovement, Collection, Devolucion


def crear_collection(*, contract_id: int, mes_cobro: datetime.date,
                     monto_cobro: Decimal, moneda: str) -> Collection:
    mes_cobro = mes_cobro.replace(day=1)
    return Collection.objects.create(
        contract_id=contract_id, mes_cobro=mes_cobro,
        monto_cobro=monto_cobro, moneda=moneda,
    )


def crear_bank_movement(*, fecha: datetime.date, glosa: str = "",
                        monto: Decimal, pagador: str = "") -> BankMovement:
    return BankMovement.objects.create(
        fecha=fecha, glosa=glosa, monto=monto, pagador=pagador,
    )


def reconciliar(*, bank_movement_id: int, asignaciones: list[dict]) -> list[Abono]:
    """Asigna una transferencia a uno o más cobros, de forma atómica.

    asignaciones: [{"collection_id": int, "monto": Decimal}, ...]
    O todo, o nada. Bloquea filas para evitar doble-asignación.
    """
    # Agregar montos por cobro (soporta entradas repetidas al mismo cobro).
    por_cobro: dict[int, Decimal] = {}
    for a in asignaciones:
        monto = Decimal(str(a["monto"]))
        if monto <= 0:
            raise MontoInvalido("El monto debe ser mayor a 0.", {"monto": str(monto)})
        por_cobro[a["collection_id"]] = por_cobro.get(a["collection_id"], Decimal("0")) + monto

    with transaction.atomic():
        mov = BankMovement.objects.select_for_update().get(pk=bank_movement_id)
        cobros = {
            c.pk: c
            for c in Collection.objects.select_for_update().filter(pk__in=list(por_cobro))
        }

        faltan = set(por_cobro) - set(cobros)
        if faltan:
            raise CobroNoEncontrado(
                "Uno o más cobros no existen.",
                {"collection_ids": sorted(faltan)},
            )

        total = Decimal("0")
        nuevos: list[Abono] = []
        for collection_id, monto in por_cobro.items():
            cobro = cobros[collection_id]
            if monto > selectors.faltante_clp(cobro):
                raise AbonoExcedeFaltante(
                    "El abono excede lo que falta del cobro.",
                    {"collection_id": collection_id,
                     "faltante": str(selectors.faltante_clp(cobro)),
                     "monto": str(monto)},
                )
            total += monto
            nuevos.append(Abono(bank_movement=mov, collection=cobro, monto=monto))

        if total > selectors.saldo_disponible(mov):
            raise SaldoInsuficiente(
                "La asignación excede el saldo disponible de la transferencia.",
                {"saldo": str(selectors.saldo_disponible(mov)), "solicitado": str(total)},
            )

        Abono.objects.bulk_create(nuevos)
        return nuevos


def devolver(*, bank_movement_id: int, monto: Decimal, motivo: str,
             fecha: datetime.date) -> Devolucion:
    monto = Decimal(str(monto))
    if monto <= 0:
        raise MontoInvalido("El monto debe ser mayor a 0.", {"monto": str(monto)})
    with transaction.atomic():
        mov = BankMovement.objects.select_for_update().get(pk=bank_movement_id)
        if monto > selectors.saldo_disponible(mov):
            raise SaldoInsuficiente(
                "La devolución excede el saldo disponible.",
                {"saldo": str(selectors.saldo_disponible(mov)), "solicitado": str(monto)},
            )
        return Devolucion.objects.create(
            bank_movement=mov, monto=monto, motivo=motivo, fecha=fecha,
        )
