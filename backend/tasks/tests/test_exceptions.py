from tasks.exceptions import DomainError, SaldoInsuficiente, drf_exception_handler


def test_domain_error_lleva_code_y_details():
    e = SaldoInsuficiente("saldo bajo", {"saldo": "10"})
    assert isinstance(e, DomainError)
    assert e.code == "saldo_insuficiente"
    assert e.message == "saldo bajo"
    assert e.details == {"saldo": "10"}


def test_handler_traduce_domain_error_a_contrato_uniforme():
    resp = drf_exception_handler(SaldoInsuficiente("sin saldo", {"saldo": "0"}), {})
    assert resp.status_code == 409
    assert resp.data == {
        "error": {"code": "saldo_insuficiente", "message": "sin saldo", "details": {"saldo": "0"}}
    }
