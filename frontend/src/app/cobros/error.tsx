"use client"

import { useEffect } from "react"
import styled from "styled-components"

const Page = styled.main`
  max-width: 1080px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
`

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 2rem;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-left: 3px solid ${({ theme }) => theme.color.error};
  border-radius: 8px;
`

const Heading = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.375rem;
  color: ${({ theme }) => theme.color.navy};
`

const Message = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.color.ink};
`

const Retry = styled.button`
  padding: 0.5625rem 1.125rem;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.color.teal};
  color: #ffffff;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;

  &:hover {
    background: #009bb2;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.navy};
    outline-offset: 2px;
  }
`

type Props = {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function Error({ error, reset }: Props): JSX.Element {
  useEffect(() => {
    // Registrar el error para diagnóstico en el servidor/cliente.
    console.error(error)
  }, [error])

  return (
    <Page>
      <Card>
        <Heading>No se pudieron cargar los cobros</Heading>
        <Message>{error.message || "Ocurrió un error inesperado."}</Message>
        <Retry type="button" onClick={reset}>
          Reintentar
        </Retry>
      </Card>
    </Page>
  )
}
