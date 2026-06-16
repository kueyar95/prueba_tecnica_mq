from decimal import Decimal

from django.db import models

UF_EN_CLP = Decimal("40000")  # UF fija para la prueba (UF real = futuro)


class Moneda(models.TextChoices):
    CLP = "CLP", "CLP"
    UF = "UF", "UF"


class Collection(models.Model):
    collection_id = models.BigAutoField(primary_key=True)
    contract_id = models.IntegerField(db_index=True)
    mes_cobro = models.DateField()
    monto_cobro = models.DecimalField(max_digits=14, decimal_places=2)
    moneda = models.CharField(max_length=3, choices=Moneda.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(monto_cobro__gt=0),
                name="collection_monto_positivo",
            ),
        ]


class BankMovement(models.Model):
    bank_movement_id = models.BigAutoField(primary_key=True)
    fecha = models.DateField()
    glosa = models.CharField(max_length=255, blank=True)
    monto = models.DecimalField(max_digits=14, decimal_places=2)  # siempre CLP
    pagador = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(monto__gt=0),
                name="bank_movement_monto_positivo",
            ),
        ]


class Abono(models.Model):
    abono_id = models.BigAutoField(primary_key=True)
    bank_movement = models.ForeignKey(
        BankMovement, on_delete=models.PROTECT, related_name="abonos",
    )
    collection = models.ForeignKey(
        Collection, on_delete=models.PROTECT, related_name="abonos",
    )
    monto = models.DecimalField(max_digits=14, decimal_places=2)  # CLP
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(monto__gt=0), name="abono_monto_positivo"),
        ]


class Devolucion(models.Model):
    devolucion_id = models.BigAutoField(primary_key=True)
    bank_movement = models.ForeignKey(
        BankMovement, on_delete=models.PROTECT, related_name="devoluciones",
    )
    monto = models.DecimalField(max_digits=14, decimal_places=2)  # CLP
    fecha = models.DateField()
    motivo = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(monto__gt=0), name="devolucion_monto_positivo"),
        ]
