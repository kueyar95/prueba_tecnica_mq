"use client"

import { createGlobalStyle } from "styled-components"

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme.font.body};
    background: ${({ theme }) => theme.color.bg};
    color: ${({ theme }) => theme.color.ink};
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`
