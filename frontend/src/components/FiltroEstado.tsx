"use client"

import Link from "next/link"
import styled from "styled-components"

import type { EstadoCobro } from "@/lib/types"

type Filtro = { value: EstadoCobro | null; label: string }

const FILTROS: readonly Filtro[] = [
  { value: null, label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "parcial", label: "Parciales" },
  { value: "pagado", label: "Pagados" },
]

const Tabs = styled.nav`
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 8px;
`

const Tab = styled(Link)<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active, theme }) => ($active ? "#ffffff" : theme.color.ink)};
  background: ${({ $active, theme }) => ($active ? theme.color.teal : "transparent")};
  transition:
    color 0.15s ease,
    background 0.15s ease;

  &:hover {
    color: ${({ $active, theme }) => ($active ? "#ffffff" : theme.color.navy)};
    background: ${({ $active, theme }) => ($active ? theme.color.teal : theme.color.bg)};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.navy};
    outline-offset: 2px;
  }
`

type Props = {
  readonly estado: EstadoCobro | null
}

export default function FiltroEstado({ estado }: Props): JSX.Element {
  return (
    <Tabs aria-label="Filtrar cobros por estado">
      {FILTROS.map((filtro) => {
        const active = filtro.value === estado
        const href = filtro.value ? `/cobros?estado=${filtro.value}` : "/cobros"
        return (
          <Tab
            key={filtro.label}
            href={href}
            $active={active}
            aria-current={active ? "page" : undefined}
          >
            {filtro.label}
          </Tab>
        )
      })}
    </Tabs>
  )
}
