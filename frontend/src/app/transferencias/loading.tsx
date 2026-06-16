"use client"

import styled, { keyframes } from "styled-components"

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`

const Page = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
`

const Bar = styled.div<{ $w: string; $h: string }>`
  width: ${({ $w }) => $w};
  height: ${({ $h }) => $h};
  border-radius: 6px;
  background: ${({ theme }) => theme.color.border};
  animation: ${pulse} 1.4s ease-in-out infinite;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

const RowSkeleton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 1rem 1.5rem;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-left: 3px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
`

const RowLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4375rem;
`

const RowRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4375rem;
`

const ROWS = [0, 1, 2, 3, 4]

export default function Loading(): JSX.Element {
  return (
    <Page aria-busy="true" aria-label="Cargando transferencias">
      <Header>
        <Bar $w="13rem" $h="2rem" />
        <Bar $w="13rem" $h="2.25rem" />
      </Header>
      <List>
        {ROWS.map((i) => (
          <RowSkeleton key={i}>
            <RowLeft>
              <Bar $w="9rem" $h="1rem" />
              <Bar $w="5.5rem" $h="0.8125rem" />
            </RowLeft>
            <RowRight>
              <Bar $w="6.5rem" $h="1.25rem" />
              <Bar $w="7rem" $h="0.875rem" />
            </RowRight>
          </RowSkeleton>
        ))}
      </List>
    </Page>
  )
}
