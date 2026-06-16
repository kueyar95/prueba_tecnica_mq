"use client"

import Link from "next/link"
import styled from "styled-components"

import { formatCLP, formatUF } from "@/lib/format"
import type { Collection } from "@/lib/types"

import EstadoChip from "./EstadoChip"

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const

function formatMes(iso: string): string {
  // mes_cobro llega como "YYYY-MM-DD" (día 1 del mes). Se parsea sin zona horaria.
  const [year, month] = iso.split("-")
  const idx = Number(month) - 1
  const mes = MESES[idx] ?? month
  return `${mes}. ${year}`
}

const Row = styled(Link)<{ $estado: Collection["estado"] }>`
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem 1rem 1.5rem;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-left: 3px solid ${({ $estado, theme }) => theme.color[$estado]};
  border-radius: 6px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.teal};
    border-left-color: ${({ $estado, theme }) => theme.color[$estado]};
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

const Mes = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1rem;
  color: ${({ theme }) => theme.color.ink};
  text-transform: capitalize;
`

const Contrato = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
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

const RefUF = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.muted};
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`

const Faltante = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.parcial};
`

type Props = {
  readonly cobro: Collection
}

export default function CobroRow({ cobro }: Props): JSX.Element {
  const faltante = Number(cobro.faltante_clp)
  const esUF = cobro.moneda === "UF"

  return (
    <Row href={`/cobros/${cobro.collection_id}`} $estado={cobro.estado}>
      <Left>
        <Mes>{formatMes(cobro.mes_cobro)}</Mes>
        <Contrato>Contrato #{cobro.contract_id}</Contrato>
      </Left>
      <Right>
        <Monto>{formatCLP(cobro.equivalente_clp)}</Monto>
        <Meta>
          {esUF ? <RefUF>{formatUF(cobro.monto_cobro)}</RefUF> : null}
          {faltante > 0 && cobro.estado === "parcial" ? (
            <Faltante>Faltan {formatCLP(cobro.faltante_clp)}</Faltante>
          ) : null}
          <EstadoChip estado={cobro.estado} />
        </Meta>
      </Right>
    </Row>
  )
}
