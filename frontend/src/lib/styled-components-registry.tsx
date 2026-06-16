"use client"

import { useServerInsertedHTML } from "next/navigation"
import { ReactNode, useState } from "react"
import { ServerStyleSheet, StyleSheetManager, ThemeProvider } from "styled-components"

import { GlobalStyles } from "@/lib/global-styles"
import { theme } from "@/lib/theme"

type Props = {
  readonly children: ReactNode
}

export default function StyledComponentsRegistry({ children }: Props): ReactNode {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()
    return <>{styles}</>
  })

  if (typeof window !== "undefined") {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    )
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </StyleSheetManager>
  )
}
