"use client"

import styled from "styled-components"

import type { EstadoCobro } from "@/lib/types"

const LABEL: Record<EstadoCobro, string> = {
  pagado: "Pagado",
  parcial: "Parcial",
  pendiente: "Pendiente",
}

const Chip = styled.span<{ $estado: EstadoCobro }>`
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
  color: ${({ $estado, theme }) => theme.color[$estado]};
  background: ${({ $estado, theme }) => theme.color[$estado]}1a;

  &::before {
    content: "";
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 50%;
    background: ${({ $estado, theme }) => theme.color[$estado]};
  }
`

type Props = {
  readonly estado: EstadoCobro
}

export default function EstadoChip({ estado }: Props): JSX.Element {
  return <Chip $estado={estado}>{LABEL[estado]}</Chip>
}
