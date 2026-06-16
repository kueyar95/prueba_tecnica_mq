from tasks.exceptions import DomainError, SaldoInsuficiente


def test_domain_error_lleva_code_y_details():
    e = SaldoInsuficiente("saldo bajo", {"saldo": "10"})
    assert isinstance(e, DomainError)
    assert e.code == "saldo_insuficiente"
    assert e.message == "saldo bajo"
    assert e.details == {"saldo": "10"}
