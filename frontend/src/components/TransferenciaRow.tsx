"use client"

import Link from "next/link"
import styled from "styled-components"

import { formatCLP } from "@/lib/format"
import type { BankMovement } from "@/lib/types"

function formatFecha(iso: string): string {
  // fecha llega como "YYYY-MM-DD". Se parsea sin zona horaria.
  const [year, month, day] = iso.split("-")
  return `${day}-${month}-${year}`
}

const Row = styled(Link)<{ $tieneSaldo: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem 1rem 1.5rem;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-left: 3px solid
    ${({ $tieneSaldo, theme }) => ($tieneSaldo ? theme.color.teal : theme.color.border)};
  border-radius: 6px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.teal};
    border-left-color: ${({ theme }) => theme.color.teal};
    box-shadow: 0 1px 3px rgba(7, 26, 47, 0.08);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.teal};
    outline-offset: 2px;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`

const Pagador = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1rem;
  color: ${({ theme }) => theme.color.ink};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Fecha = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.muted};
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.375rem;
  text-align: right;
`

const Monto = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.25rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.navy};
  line-height: 1.1;
`

const SaldoChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.1875rem 0.625rem;
  border-radius: 999px;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.01em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.teal};
  background: ${({ theme }) => theme.color.teal}1a;

  &::before {
    content: "";
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 50%;
    background: ${({ theme }) => theme.color.teal};
  }
`

const Aplicada = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.muted};
`

type Props = {
  readonly movimiento: BankMovement
}

export default function TransferenciaRow({ movimiento }: Props): JSX.Element {
  const saldo = Number(movimiento.saldo_disponible)
  const tieneSaldo = saldo > 0

  return (
    <Row href={`/transferencias/${movimiento.bank_movement_id}`} $tieneSaldo={tieneSaldo}>
      <Left>
        <Pagador>{movimiento.pagador}</Pagador>
        <Fecha>{formatFecha(movimiento.fecha)}</Fecha>
      </Left>
      <Right>
        <Monto>{formatCLP(movimiento.monto)}</Monto>
        {tieneSaldo ? (
          <SaldoChip>Disponible {formatCLP(movimiento.saldo_disponible)}</SaldoChip>
        ) : (
          <Aplicada>Sin saldo disponible</Aplicada>
        )}
      </Right>
    </Row>
  )
}
