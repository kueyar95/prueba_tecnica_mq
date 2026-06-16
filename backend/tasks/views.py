from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from . import selectors, services
from .models import BankMovement, Collection
from .serializers import (
    BankMovementCreateSerializer,
    BankMovementDetailSerializer,
    BankMovementSerializer,
    CollectionCreateSerializer,
    CollectionDetailSerializer,
    CollectionSerializer,
    DevolverSerializer,
    ReconciliarSerializer,
)


class CollectionListCreateView(APIView):
    def get(self, request):
        cobros = selectors.listar_collections(
            estado_filtro=request.query_params.get("estado"),
            contract_id=request.query_params.get("contract_id"),
            moneda=request.query_params.get("moneda"),
        )
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(cobros, request, view=self)
        data = CollectionSerializer(page, many=True).data
        return paginator.get_paginated_response(data)

    def post(self, request):
        ser = CollectionCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        cobro = services.crear_collection(**ser.validated_data)
        return Response(CollectionSerializer(cobro).data, status=status.HTTP_201_CREATED)


class CollectionDetailView(APIView):
    def get(self, request, collection_id: int):
        cobro = get_object_or_404(Collection, pk=collection_id)
        return Response(CollectionDetailSerializer(cobro).data)


class BankMovementListCreateView(APIView):
    def get(self, request):
        movimientos = selectors.listar_bank_movements()
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(movimientos, request, view=self)
        data = BankMovementSerializer(page, many=True).data
        return paginator.get_paginated_response(data)

    def post(self, request):
        ser = BankMovementCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        mov = services.crear_bank_movement(**ser.validated_data)
        return Response(BankMovementSerializer(mov).data, status=status.HTTP_201_CREATED)


class BankMovementDetailView(APIView):
    def get(self, request, bank_movement_id: int):
        mov = get_object_or_404(BankMovement, pk=bank_movement_id)
        return Response(BankMovementDetailSerializer(mov).data)


class AbonosView(APIView):
    def post(self, request, bank_movement_id: int):
        ser = ReconciliarSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        mov = get_object_or_404(BankMovement, pk=bank_movement_id)
        services.reconciliar(
            bank_movement_id=mov.pk,
            asignaciones=ser.validated_data["asignaciones"],
        )
        mov.refresh_from_db()
        return Response(BankMovementDetailSerializer(mov).data, status=status.HTTP_201_CREATED)


class DevolucionesView(APIView):
    def post(self, request, bank_movement_id: int):
        ser = DevolverSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        mov = get_object_or_404(BankMovement, pk=bank_movement_id)
        services.devolver(bank_movement_id=mov.pk, **ser.validated_data)
        mov.refresh_from_db()
        return Response(BankMovementDetailSerializer(mov).data, status=status.HTTP_201_CREATED)
