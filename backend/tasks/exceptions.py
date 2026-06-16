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
