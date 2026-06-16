"use client"

import Link from "next/link"
import styled from "styled-components"

import EstadoChip from "@/components/EstadoChip"
import { formatCLP, formatUF } from "@/lib/format"
import type { Abono, CollectionDetail } from "@/lib/types"

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const

function formatMesLargo(iso: string): string {
  const [year, month] = iso.split("-")
  const mes = MESES[Number(month) - 1] ?? month
  return `${mes} ${year}`
}

function formatFecha(iso: string): string {
  const [date] = iso.split("T")
  const [year, month, day] = date.split("-")
  return `${day}-${month}-${year}`
}

const Page = styled.main`
  max-width: 760px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
`

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.muted};

  &:hover {
    color: ${({ theme }) => theme.color.teal};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.teal};
    outline-offset: 2px;
    border-radius: 4px;
  }
`

const Card = styled.section<{ $estado: CollectionDetail["estado"] }>`
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-top: 3px solid ${({ $estado, theme }) => theme.color[$estado]};
  border-radius: 10px;
  overflow: hidden;
`

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.75rem 1.75rem 1.5rem;
`

const HeadLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const Eyebrow = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.muted};
`

const Mes = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.5rem;
  text-transform: capitalize;
  color: ${({ theme }) => theme.color.navy};
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.375rem;
`

const Monto = styled.div`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 2.25rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.navy};
`

const UFChip = styled.span`
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.color.bg};
  border: 1px solid ${({ theme }) => theme.color.border};
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.muted};
`

const Balance = styled.div`
  padding: 0 1.75rem 1.5rem;
`

const BalanceTrack = styled.div`
  position: relative;
  height: 0.5rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.color.bg};
  overflow: hidden;
`

const BalanceFill = styled.div<{ $pct: number; $estado: CollectionDetail["estado"] }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $estado, theme }) => theme.color[$estado]};
  transition: width 0.3s ease;
`

const BalanceLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.muted};
`

const Faltante = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.color.parcial};
`

const Settled = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.color.pagado};
`

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.75rem;
  border-top: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.bg};
`

const MetaLabel = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.muted};
`

const MetaValue = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.ink};
`

const Section = styled.div`
  padding: 1.5rem 1.75rem 1.75rem;
  border-top: 1px solid ${({ theme }) => theme.color.border};
`

const SectionTitle = styled.h2`
  margin: 0 0 1rem;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.0625rem;
  color: ${({ theme }) => theme.color.navy};
`

const Abonos = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const AbonoItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.color.surface};
`

const AbonoFrom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`

const AbonoTitle = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.ink};
`

const AbonoDate = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.muted};
`

const AbonoMonto = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.0625rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.pagado};
`

const Empty = styled.p`
  margin: 0;
  padding: 1.25rem 1rem;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.color.border};
  border-radius: 6px;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.muted};
`

function abonadoCLP(total: number, faltante: number): number {
  return Math.max(total - faltante, 0)
}

type Props = {
  readonly cobro: CollectionDetail
}

export default function CobroDetalle({ cobro }: Props): JSX.Element {
  const totalCLP = Number(cobro.equivalente_clp)
  const faltanteCLP = Number(cobro.faltante_clp)
  const abonado = abonadoCLP(totalCLP, faltanteCLP)
  const pct = totalCLP > 0 ? Math.min((abonado / totalCLP) * 100, 100) : 0
  const esUF = cobro.moneda === "UF"

  return (
    <Page>
      <Back href="/cobros">← Volver a cobros</Back>

      <Card $estado={cobro.estado}>
        <Head>
          <HeadLeft>
            <Eyebrow>Contrato #{cobro.contract_id}</Eyebrow>
            <Mes>{formatMesLargo(cobro.mes_cobro)}</Mes>
            <EstadoChip estado={cobro.estado} />
          </HeadLeft>
          <Amounts>
            <Monto>{formatCLP(cobro.equivalente_clp)}</Monto>
            {esUF ? <UFChip>{formatUF(cobro.monto_cobro)}</UFChip> : null}
          </Amounts>
        </Head>

        <Balance>
          <BalanceTrack
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalCLP}
            aria-valuenow={abonado}
            aria-label="Avance del pago"
          >
            <BalanceFill $pct={pct} $estado={cobro.estado} />
          </BalanceTrack>
          <BalanceLabels>
            <span>Abonado {formatCLP(abonado)}</span>
            {faltanteCLP > 0 ? (
              <Faltante>Faltan {formatCLP(cobro.faltante_clp)}</Faltante>
            ) : (
              <Settled>Pagado por completo</Settled>
            )}
          </BalanceLabels>
        </Balance>

        <MetaRow>
          <MetaLabel>Monto del cobro</MetaLabel>
          <MetaValue>
            {esUF ? formatUF(cobro.monto_cobro) : formatCLP(cobro.monto_cobro)}
          </MetaValue>
        </MetaRow>

        <Section>
          <SectionTitle>Pagado por</SectionTitle>
          {cobro.abonos.length === 0 ? (
            <Empty>Este cobro todavía no tiene pagos aplicados.</Empty>
          ) : (
            <Abonos>
              {cobro.abonos.map((abono: Abono) => (
                <AbonoItem key={abono.abono_id}>
                  <AbonoFrom>
                    <AbonoTitle>Transferencia #{abono.bank_movement}</AbonoTitle>
                    <AbonoDate>{formatFecha(abono.created_at)}</AbonoDate>
                  </AbonoFrom>
                  <AbonoMonto>{formatCLP(abono.monto)}</AbonoMonto>
                </AbonoItem>
              ))}
            </Abonos>
          )}
        </Section>
      </Card>
    </Page>
  )
}
