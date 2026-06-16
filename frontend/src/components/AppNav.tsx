"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styled from "styled-components"

const Bar = styled.header`
  background: ${({ theme }) => theme.color.navy};
  border-bottom: 3px solid ${({ theme }) => theme.color.teal};
  color: #ffffff;
`

const Inner = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 2.5rem;
`

const Brand = styled(Link)`
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.01em;
  color: #ffffff;
  white-space: nowrap;

  &:hover {
    color: #ffffff;
  }
`

const Nav = styled.nav`
  display: flex;
  align-items: stretch;
  align-self: stretch;
  gap: 0.25rem;
`

const NavLink = styled(Link)<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0 0.875rem;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.9375rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active, theme }) => ($active ? "#ffffff" : theme.color.border)};
  border-bottom: 3px solid
    ${({ $active, theme }) => ($active ? theme.color.teal : "transparent")};
  margin-bottom: -3px;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.teal};
    outline-offset: -2px;
  }
`

type NavItem = { href: string; label: string }

const ITEMS: readonly NavItem[] = [
  { href: "/cobros", label: "Cobros" },
  { href: "/transferencias", label: "Transferencias" },
]

export default function AppNav(): JSX.Element {
  const pathname = usePathname()

  return (
    <Bar>
      <Inner>
        <Brand href="/cobros">Conciliación de arriendo</Brand>
        <Nav>
          {ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              $active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            >
              {item.label}
            </NavLink>
          ))}
        </Nav>
      </Inner>
    </Bar>
  )
}
