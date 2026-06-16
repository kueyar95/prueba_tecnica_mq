"use client"

import styled from "styled-components"

export const Page = styled.main`
  max-width: 1080px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
`

export const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 2rem;
  letter-spacing: 0.005em;
  color: ${({ theme }) => theme.color.navy};
`

export const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`

export const TransferenciasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

export const EmptyState = styled.p`
  margin: 0;
  padding: 3rem 1.5rem;
  text-align: center;
  background: ${({ theme }) => theme.color.surface};
  border: 1px dashed ${({ theme }) => theme.color.border};
  border-radius: 8px;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.color.muted};
`
