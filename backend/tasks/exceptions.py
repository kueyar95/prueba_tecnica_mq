class DomainError(Exception):
    code = "domain_error"
    status_code = 422

    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class MontoInvalido(DomainError):
    code = "monto_invalido"
    status_code = 400


class SaldoInsuficiente(DomainError):
    code = "saldo_insuficiente"
    status_code = 409


class AbonoExcedeFaltante(DomainError):
    code = "abono_excede_faltante"
    status_code = 409


class CobroNoEncontrado(DomainError):
    code = "cobro_no_encontrado"
    status_code = 404


from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_default_handler


def drf_exception_handler(exc, context):
    if isinstance(exc, DomainError):
        return Response(
            {"error": {"code": exc.code, "message": exc.message, "details": exc.details}},
            status=exc.status_code,
        )
    return drf_default_handler(exc, context)
