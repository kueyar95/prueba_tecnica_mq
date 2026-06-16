from decimal import Decimal

from django.db.models import Sum

from .models import UF_EN_CLP, BankMovement, Collection, Moneda


def equivalente_clp(monto: Decimal, moneda: str) -> Decimal:
    """Convierte un monto a su equivalente en CLP usando la UF fija."""
    if moneda == Moneda.UF:
        return monto * UF_EN_CLP
    return monto


def _sum(qs) -> Decimal:
    result = qs.aggregate(s=Sum("monto"))["s"]
    return result if result is not None else Decimal("0")


def abonado_clp(collection: Collection) -> Decimal:
    return _sum(collection.abonos)


def faltante_clp(collection: Collection) -> Decimal:
    necesario = equivalente_clp(collection.monto_cobro, collection.moneda)
    return necesario - abonado_clp(collection)


def estado(collection: Collection) -> str:
    pagado = abonado_clp(collection)
    necesario = equivalente_clp(collection.monto_cobro, collection.moneda)
    if pagado <= 0:
        return "pendiente"
    if pagado >= necesario:
        return "pagado"
    return "parcial"


def saldo_disponible(movement: BankMovement) -> Decimal:
    return movement.monto - _sum(movement.abonos) - _sum(movement.devoluciones)


def listar_collections(*, estado_filtro: str | None = None, contract_id: int | None = None,
                       moneda: str | None = None):
    qs = Collection.objects.all().order_by("-mes_cobro", "-collection_id")
    if contract_id is not None:
        qs = qs.filter(contract_id=contract_id)
    if moneda is not None:
        qs = qs.filter(moneda=moneda)
    cobros = list(qs)
    if estado_filtro is not None:
        cobros = [c for c in cobros if estado(c) == estado_filtro]
    return cobros


def listar_bank_movements():
    return list(BankMovement.objects.all().order_by("-fecha", "-bank_movement_id"))
