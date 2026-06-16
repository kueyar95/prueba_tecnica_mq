"use client"

import Link from "next/link"
import styled from "styled-components"

import DevolverForm from "@/components/DevolverForm"
import { formatCLP } from "@/lib/format"
import type { Abono, BankMovementDetail, Devolucion } from "@/lib/types"

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

const Card = styled.section<{ $tieneSaldo: boolean }>`
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-top: 3px solid
    ${({ $tieneSaldo, theme }) => ($tieneSaldo ? theme.color.teal : theme.color.border)};
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
  min-width: 0;
`

const Eyebrow = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.muted};
`

const Pagador = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.color.navy};
`

const Glosa = styled.p`
  margin: 0.125rem 0 0;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.ink};
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

const SaldoChip = styled.span<{ $tieneSaldo: boolean }>`
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
  color: ${({ $tieneSaldo, theme }) => ($tieneSaldo ? theme.color.teal : theme.color.muted)};
  background: ${({ $tieneSaldo, theme }) =>
    $tieneSaldo ? `${theme.color.teal}1a` : theme.color.bg};

  &::before {
    content: "";
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 50%;
    background: ${({ $tieneSaldo, theme }) =>
      $tieneSaldo ? theme.color.teal : theme.color.muted};
  }
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

const BalanceFill = styled.div<{ $pct: number }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $pct }) => $pct}%;
  background: ${({ theme }) => theme.color.teal};
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

const Aplicado = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.color.ink};
`

const Disponible = styled.span<{ $tieneSaldo: boolean }>`
  font-weight: 600;
  color: ${({ $tieneSaldo, theme }) => ($tieneSaldo ? theme.color.teal : theme.color.muted)};
`

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  font-variant-numeric: tabular-nums;
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

const Items = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.color.surface};
`

const AbonoLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.color.surface};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.teal};
    box-shadow: 0 1px 3px rgba(7, 26, 47, 0.08);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.teal};
    outline-offset: 2px;
  }
`

const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
`

const ItemTitle = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.ink};
`

const ItemSub = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.muted};
`

const AbonoMonto = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.0625rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.pagado};
  white-space: nowrap;
`

const DevolucionMonto = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.0625rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.parcial};
  white-space: nowrap;
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

const ActionsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.75rem 1.75rem;
  border-top: 1px solid ${({ theme }) => theme.color.border};
`

const ConciliarLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.color.teal};
  color: #ffffff;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 0.9375rem;
  letter-spacing: 0.01em;
  transition: background 0.15s ease;

  &:hover {
    background: #009bb2;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.navy};
    outline-offset: 2px;
  }
`

const ConciliarDisabled = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.color.bg};
  color: ${({ theme }) => theme.color.muted};
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 0.9375rem;
  letter-spacing: 0.01em;
  cursor: not-allowed;
`

const AllApplied = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.muted};
`

type Props = {
  readonly movimiento: BankMovementDetail
}

export default function TransferenciaDetalle({ movimiento }: Props): JSX.Element {
  const total = Number(movimiento.monto)
  const saldo = Number(movimiento.saldo_disponible)
  const tieneSaldo = saldo > 0
  const aplicado = Math.max(total - saldo, 0)
  const pct = total > 0 ? Math.min((aplicado / total) * 100, 100) : 0

  return (
    <Page>
      <Back href="/transferencias">← Volver a transferencias</Back>

      <Card $tieneSaldo={tieneSaldo}>
        <Head>
          <HeadLeft>
            <Eyebrow>Transferencia #{movimiento.bank_movement_id}</Eyebrow>
            <Pagador>{movimiento.pagador}</Pagador>
            <Glosa>{movimiento.glosa}</Glosa>
          </HeadLeft>
          <Amounts>
            <Monto>{formatCLP(movimiento.monto)}</Monto>
            <SaldoChip $tieneSaldo={tieneSaldo}>
              {tieneSaldo
                ? `Disponible ${formatCLP(movimiento.saldo_disponible)}`
                : "Sin saldo disponible"}
            </SaldoChip>
          </Amounts>
        </Head>

        <Balance>
          <BalanceTrack
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={aplicado}
            aria-label="Saldo aplicado de la transferencia"
          >
            <BalanceFill $pct={pct} />
          </BalanceTrack>
          <BalanceLabels>
            <Aplicado>Aplicado {formatCLP(aplicado)}</Aplicado>
            <Disponible $tieneSaldo={tieneSaldo}>
              Disponible {formatCLP(movimiento.saldo_disponible)}
            </Disponible>
          </BalanceLabels>
        </Balance>

        <MetaRow>
          <MetaLabel>Fecha de la transferencia</MetaLabel>
          <MetaValue>{formatFecha(movimiento.fecha)}</MetaValue>
        </MetaRow>

        <Section>
          <SectionTitle>Aplicada a</SectionTitle>
          {movimiento.abonos.length === 0 ? (
            <Empty>Esta transferencia todavía no se ha aplicado a ningún cobro.</Empty>
          ) : (
            <Items>
              {movimiento.abonos.map((abono: Abono) => (
                <li key={abono.abono_id}>
                  <AbonoLink href={`/cobros/${abono.collection}`}>
                    <ItemBody>
                      <ItemTitle>Cobro #{abono.collection}</ItemTitle>
                      <ItemSub>{formatFecha(abono.created_at)}</ItemSub>
                    </ItemBody>
                    <AbonoMonto>{formatCLP(abono.monto)}</AbonoMonto>
                  </AbonoLink>
                </li>
              ))}
            </Items>
          )}
        </Section>

        <Section>
          <SectionTitle>Devoluciones</SectionTitle>
          {movimiento.devoluciones.length === 0 ? (
            <Empty>No hay devoluciones registradas para esta transferencia.</Empty>
          ) : (
            <Items>
              {movimiento.devoluciones.map((devolucion: Devolucion) => (
                <Item key={devolucion.devolucion_id}>
                  <ItemBody>
                    <ItemTitle>{devolucion.motivo}</ItemTitle>
                    <ItemSub>{formatFecha(devolucion.fecha)}</ItemSub>
                  </ItemBody>
                  <DevolucionMonto>− {formatCLP(devolucion.monto)}</DevolucionMonto>
                </Item>
              ))}
            </Items>
          )}
        </Section>

        <ActionsBar>
          {tieneSaldo ? (
            <>
              <ConciliarLink href={`/transferencias/${movimiento.bank_movement_id}/conciliar`}>
                Conciliar
              </ConciliarLink>
              <DevolverForm
                movimientoId={movimiento.bank_movement_id}
                saldoDisponible={movimiento.saldo_disponible}
              />
            </>
          ) : (
            <>
              <ConciliarDisabled aria-disabled="true">Conciliar</ConciliarDisabled>
              <AllApplied>
                El saldo de esta transferencia ya fue aplicado o devuelto por completo.
              </AllApplied>
            </>
          )}
        </ActionsBar>
      </Card>
    </Page>
  )
}
