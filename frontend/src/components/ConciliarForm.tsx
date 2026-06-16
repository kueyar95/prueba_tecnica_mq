"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import styled from "styled-components"

import { conciliar } from "@/app/actions"
import { formatCLP, formatUF } from "@/lib/format"
import type { BankMovementDetail, Collection } from "@/lib/types"

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
  // mes_cobro llega como "YYYY-MM-DD"; se parsea sin zona horaria.
  const [year, month] = iso.split("-")
  const idx = Number(month) - 1
  const mes = MESES[idx] ?? month
  return `${mes}. ${year}`
}

// Math en centavos para evitar errores de coma flotante al sumar/comparar.
// Solo para la UI en vivo; a la action se envía el string original limpio.
function toCents(raw: string): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round(n * 100)
}

const Page = styled.main`
  max-width: 760px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 8rem;
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

const Card = styled.section`
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-top: 3px solid ${({ theme }) => theme.color.teal};
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

const Titulo = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.color.navy};
`

const Pagador = styled.p`
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
  background: ${({ theme }) => `${theme.color.teal}1a`};

  &::before {
    content: "";
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 50%;
    background: ${({ theme }) => theme.color.teal};
  }
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

const Rows = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

const RowItem = styled.li<{ $excede: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid ${({ $excede, theme }) => ($excede ? theme.color.error : theme.color.border)};
  border-radius: 8px;
  background: ${({ theme }) => theme.color.surface};
  transition: border-color 0.15s ease;
`

const RowBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`

const RowTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const Mes = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1rem;
  color: ${({ theme }) => theme.color.ink};
  text-transform: capitalize;
`

const UFChip = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.6875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  padding: 0.0625rem 0.4375rem;
  border-radius: 999px;
  color: ${({ theme }) => theme.color.navy};
  background: ${({ theme }) => theme.color.bg};
`

const RowSub = styled.span<{ $excede: boolean }>`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: ${({ $excede, theme }) => ($excede ? theme.color.error : theme.color.muted)};
`

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`

const InputLine = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
`

const InputPrefix = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.muted};
`

const MontoInput = styled.input<{ $excede: boolean }>`
  width: 10rem;
  padding: 0.5rem 0.75rem;
  text-align: right;
  border: 1px solid ${({ $excede, theme }) => ($excede ? theme.color.error : theme.color.border)};
  border-radius: 6px;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.0625rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.navy};
  background: ${({ theme }) => theme.color.surface};

  &::placeholder {
    color: ${({ theme }) => theme.color.muted};
    font-weight: 400;
  }

  &:focus {
    outline: none;
    border-color: ${({ $excede, theme }) => ($excede ? theme.color.error : theme.color.teal)};
    box-shadow: 0 0 0 3px
      ${({ $excede, theme }) => ($excede ? `${theme.color.error}33` : `${theme.color.teal}33`)};
  }

  /* Oculta los spinners para una cifra más limpia. */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
  appearance: textfield;
`

const FillButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.teal};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.teal};
    outline-offset: 2px;
    border-radius: 4px;
  }
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

// --- Pie de balance (el momento "cuadra") ---

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  margin-top: 1.5rem;
  padding: 1.25rem 1.5rem 1.375rem;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 12px;
  box-shadow: 0 -2px 24px rgba(7, 26, 47, 0.1);
`

type EstadoBarra = "vacio" | "cuadra" | "excede"

const Track = styled.div`
  position: relative;
  height: 0.625rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.color.bg};
  overflow: hidden;
`

const Fill = styled.div<{ $pct: number; $estado: EstadoBarra }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $pct }) => $pct}%;
  border-radius: 999px;
  background: ${({ $estado, theme }) =>
    $estado === "excede" ? theme.color.error : theme.color.teal};
  transition:
    width 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.2s ease;
`

const Labels = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.75rem;
`

const Asignado = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.25rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.navy};
`

const SaldoRef = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.muted};
`

const Cuadra = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.color.pagado};

  &::before {
    content: "";
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: ${({ theme }) => theme.color.pagado};
  }

  @media (prefers-reduced-motion: no-preference) {
    animation: cuadra-in 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @keyframes cuadra-in {
    from {
      opacity: 0;
      transform: translateY(2px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`

const RestoNote = styled.span<{ $estado: EstadoBarra }>`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.9375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${({ $estado, theme }) =>
    $estado === "excede" ? theme.color.error : theme.color.muted};
`

const ErrorBanner = styled.p`
  margin: 0.875rem 0 0;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  background: ${({ theme }) => `${theme.color.error}14`};
  border: 1px solid ${({ theme }) => `${theme.color.error}55`};
  color: ${({ theme }) => theme.color.error};
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
  font-weight: 500;
`

const Confirmar = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 0.8125rem 1.125rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.color.teal};
  color: #ffffff;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.05s ease;

  &:hover:not(:disabled) {
    background: #009bb2;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    background: ${({ theme }) => theme.color.bg};
    color: ${({ theme }) => theme.color.muted};
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.navy};
    outline-offset: 2px;
  }
`

type Props = {
  readonly movement: BankMovementDetail
  readonly cobros: readonly Collection[]
}

export default function ConciliarForm({ movement, cobros }: Props): JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [montos, setMontos] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)

  const saldoCents = useMemo(() => toCents(movement.saldo_disponible), [movement.saldo_disponible])

  const setMonto = (id: number, value: string): void => {
    setMontos((prev) => ({ ...prev, [id]: value }))
    if (error) setError(null)
  }

  // Cálculo en vivo: total asignado, resto y validación por cobro / global.
  const { totalCents, algunoExcede } = useMemo(() => {
    let total = 0
    let excede = false
    for (const cobro of cobros) {
      const cents = toCents(montos[cobro.collection_id] ?? "")
      total += cents
      if (cents > toCents(cobro.faltante_clp)) excede = true
    }
    return { totalCents: total, algunoExcede: excede }
  }, [cobros, montos])

  const excedeSaldo = totalCents > saldoCents
  const restoCents = saldoCents - totalCents
  const cuadra = totalCents > 0 && !excedeSaldo && !algunoExcede

  const estadoBarra: EstadoBarra = excedeSaldo || algunoExcede ? "excede" : cuadra ? "cuadra" : "vacio"
  const pct = saldoCents > 0 ? Math.min((totalCents / saldoCents) * 100, 100) : 0

  const onConfirmar = (): void => {
    if (!cuadra || isPending) return
    // Solo los cobros con monto > 0. Se envía el string del input (limpio),
    // sin pasar por Number, para no perder precisión en los decimales.
    const asignaciones = cobros
      .filter((cobro) => toCents(montos[cobro.collection_id] ?? "") > 0)
      .map((cobro) => ({
        collection_id: cobro.collection_id,
        monto: (montos[cobro.collection_id] ?? "").trim(),
      }))

    startTransition(async () => {
      const res = await conciliar(movement.bank_movement_id, asignaciones)
      if (res.ok) {
        router.push(`/transferencias/${movement.bank_movement_id}`)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <Page>
      <Back href={`/transferencias/${movement.bank_movement_id}`}>← Volver a la transferencia</Back>

      <Card>
        <Head>
          <HeadLeft>
            <Eyebrow>Transferencia #{movement.bank_movement_id}</Eyebrow>
            <Titulo>Conciliar transferencia</Titulo>
            <Pagador>{movement.pagador}</Pagador>
          </HeadLeft>
          <Amounts>
            <Monto>{formatCLP(movement.monto)}</Monto>
            <SaldoChip>Disponible {formatCLP(movement.saldo_disponible)}</SaldoChip>
          </Amounts>
        </Head>

        <Section>
          <SectionTitle>Asignar a cobros</SectionTitle>
          {cobros.length === 0 ? (
            <Empty>No hay cobros pendientes ni parciales por conciliar.</Empty>
          ) : (
            <Rows>
              {cobros.map((cobro) => {
                const faltanteCents = toCents(cobro.faltante_clp)
                const valor = montos[cobro.collection_id] ?? ""
                const excedeCobro = toCents(valor) > faltanteCents
                const inputId = `monto-${cobro.collection_id}`
                return (
                  <RowItem key={cobro.collection_id} $excede={excedeCobro}>
                    <RowBody>
                      <RowTop>
                        <Mes>{formatMes(cobro.mes_cobro)}</Mes>
                        {cobro.moneda === "UF" ? (
                          <UFChip>{formatUF(cobro.monto_cobro)}</UFChip>
                        ) : null}
                        <EstadoChip estado={cobro.estado} />
                      </RowTop>
                      <RowSub $excede={excedeCobro}>
                        {excedeCobro
                          ? `Máximo ${formatCLP(cobro.faltante_clp)} · Contrato #${cobro.contract_id}`
                          : `Faltan ${formatCLP(cobro.faltante_clp)} · Contrato #${cobro.contract_id}`}
                      </RowSub>
                    </RowBody>
                    <InputWrap>
                      <InputLine>
                        <InputPrefix>$</InputPrefix>
                        <MontoInput
                          id={inputId}
                          $excede={excedeCobro}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max={cobro.faltante_clp}
                          step="0.01"
                          placeholder="0"
                          value={valor}
                          aria-label={`Monto a abonar al cobro de ${formatMes(cobro.mes_cobro)}`}
                          aria-invalid={excedeCobro}
                          onChange={(e) => setMonto(cobro.collection_id, e.target.value)}
                        />
                      </InputLine>
                      <FillButton
                        type="button"
                        onClick={() => setMonto(cobro.collection_id, cobro.faltante_clp)}
                      >
                        Cubrir faltante
                      </FillButton>
                    </InputWrap>
                  </RowItem>
                )
              })}
            </Rows>
          )}
        </Section>
      </Card>

      {cobros.length > 0 ? (
        <Footer>
          <Track
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={saldoCents / 100}
            aria-valuenow={totalCents / 100}
            aria-label="Total asignado respecto del saldo disponible"
          >
            <Fill $pct={pct} $estado={estadoBarra} />
          </Track>

          <Labels>
            <Asignado>
              Asignado {formatCLP(totalCents / 100)}{" "}
              <SaldoRef>/ {formatCLP(movement.saldo_disponible)}</SaldoRef>
            </Asignado>
            {cuadra ? (
              <Cuadra>cuadra</Cuadra>
            ) : (
              <RestoNote $estado={estadoBarra}>
                {excedeSaldo
                  ? `Excede por ${formatCLP(Math.abs(restoCents) / 100)}`
                  : algunoExcede
                    ? "Revisa los montos"
                    : `Resto ${formatCLP(restoCents / 100)}`}
              </RestoNote>
            )}
          </Labels>

          {error ? <ErrorBanner role="alert">{error}</ErrorBanner> : null}

          <Confirmar type="button" disabled={!cuadra || isPending} onClick={onConfirmar}>
            {isPending ? "Conciliando…" : "Confirmar conciliación"}
          </Confirmar>
        </Footer>
      ) : null}
    </Page>
  )
}
