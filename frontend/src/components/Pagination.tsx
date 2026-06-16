"use client"

import Link from "next/link"
import styled from "styled-components"

type Props = {
  /** Ruta base sin query string, p.ej. "/cobros". */
  readonly basePath: string
  /** Página actual (1-indexada). */
  readonly page: number
  /** Total de elementos (DRF `count`). */
  readonly count: number
  /** Elementos por página (debe coincidir con el PAGE_SIZE del backend). */
  readonly pageSize: number
  /** URL de la página siguiente (DRF `next`); null si es la última. */
  readonly hasNext: boolean
  /** URL de la página anterior (DRF `previous`); null si es la primera. */
  readonly hasPrevious: boolean
  /** Parámetros de query a preservar entre páginas (p.ej. `estado`). */
  readonly extraParams?: Readonly<Record<string, string>>
}

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
`

const Range = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.muted};
`

const Controls = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`

const sharedButton = `
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
`

const PageLink = styled(Link)`
  ${sharedButton}
  font-family: ${({ theme }) => theme.font.body};
  color: ${({ theme }) => theme.color.ink};
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.color.navy};
    border-color: ${({ theme }) => theme.color.navy};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.navy};
    outline-offset: 2px;
  }
`

const DisabledButton = styled.span`
  ${sharedButton}
  font-family: ${({ theme }) => theme.font.body};
  color: ${({ theme }) => theme.color.muted};
  background: ${({ theme }) => theme.color.bg};
  border: 1px solid ${({ theme }) => theme.color.border};
  cursor: not-allowed;
`

function buildHref(
  basePath: string,
  page: number,
  extraParams: Readonly<Record<string, string>>,
): string {
  const params = new URLSearchParams(extraParams)
  if (page > 1) {
    params.set("page", String(page))
  }
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export default function Pagination({
  basePath,
  page,
  count,
  pageSize,
  hasNext,
  hasPrevious,
  extraParams = {},
}: Props): JSX.Element | null {
  if (count === 0) {
    return null
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, count)

  return (
    <Nav aria-label="Paginación">
      <Range>
        Mostrando {from}–{to} de {count}
      </Range>
      <Controls>
        {hasPrevious ? (
          <PageLink href={buildHref(basePath, page - 1, extraParams)} rel="prev">
            Anterior
          </PageLink>
        ) : (
          <DisabledButton aria-disabled="true">Anterior</DisabledButton>
        )}
        {hasNext ? (
          <PageLink href={buildHref(basePath, page + 1, extraParams)} rel="next">
            Siguiente
          </PageLink>
        ) : (
          <DisabledButton aria-disabled="true">Siguiente</DisabledButton>
        )}
      </Controls>
    </Nav>
  )
}
