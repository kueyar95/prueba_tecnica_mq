from decimal import Decimal

from rest_framework import serializers

from . import selectors
from .models import Abono, BankMovement, Collection, Devolucion


class AbonoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Abono
        fields = ["abono_id", "bank_movement", "collection", "monto", "created_at"]


class DevolucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Devolucion
        fields = ["devolucion_id", "bank_movement", "monto", "fecha", "motivo", "created_at"]


class CollectionSerializer(serializers.ModelSerializer):
    equivalente_clp = serializers.SerializerMethodField()
    faltante_clp = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = [
            "collection_id", "contract_id", "mes_cobro", "monto_cobro", "moneda",
            "equivalente_clp", "faltante_clp", "estado", "created_at", "updated_at",
        ]

    def get_equivalente_clp(self, obj):
        return f"{selectors.equivalente_clp(obj.monto_cobro, obj.moneda):.2f}"

    def get_faltante_clp(self, obj):
        return f"{selectors.faltante_clp(obj):.2f}"

    def get_estado(self, obj):
        return selectors.estado(obj)


class CollectionCreateSerializer(serializers.ModelSerializer):
    monto_cobro = serializers.DecimalField(
        max_digits=14, decimal_places=2, min_value=Decimal("0.01")
    )

    class Meta:
        model = Collection
        fields = ["contract_id", "mes_cobro", "monto_cobro", "moneda"]


class CollectionDetailSerializer(CollectionSerializer):
    abonos = AbonoSerializer(many=True, read_only=True)

    class Meta(CollectionSerializer.Meta):
        fields = CollectionSerializer.Meta.fields + ["abonos"]


class BankMovementSerializer(serializers.ModelSerializer):
    saldo_disponible = serializers.SerializerMethodField()

    class Meta:
        model = BankMovement
        fields = [
            "bank_movement_id", "fecha", "glosa", "monto", "pagador",
            "saldo_disponible", "created_at", "updated_at",
        ]

    def get_saldo_disponible(self, obj):
        return f"{selectors.saldo_disponible(obj):.2f}"


class BankMovementCreateSerializer(serializers.ModelSerializer):
    monto = serializers.DecimalField(
        max_digits=14, decimal_places=2, min_value=Decimal("0.01")
    )

    class Meta:
        model = BankMovement
        fields = ["fecha", "glosa", "monto", "pagador"]


class BankMovementDetailSerializer(BankMovementSerializer):
    abonos = AbonoSerializer(many=True, read_only=True)
    devoluciones = DevolucionSerializer(many=True, read_only=True)

    class Meta(BankMovementSerializer.Meta):
        fields = BankMovementSerializer.Meta.fields + ["abonos", "devoluciones"]


class _AsignacionSerializer(serializers.Serializer):
    collection_id = serializers.IntegerField()
    monto = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0.01"))


class ReconciliarSerializer(serializers.Serializer):
    asignaciones = _AsignacionSerializer(many=True, allow_empty=False)


class DevolverSerializer(serializers.Serializer):
    monto = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0.01"))
    motivo = serializers.CharField(required=False, allow_blank=True, default="")
    fecha = serializers.DateField()
