import type { Metadata } from "next"
import { ReactNode } from "react"

import AppNav from "@/components/AppNav"
import { karbon, roboto } from "@/lib/fonts"
import StyledComponentsRegistry from "@/lib/styled-components-registry"

type Props = {
  readonly children: ReactNode
}

export const metadata: Metadata = {
  title: "Conciliación de arriendo — MQ",
  description: "Starter frontend para prueba tecnica junior fullstack",
}

export default function RootLayout({ children }: Props): ReactNode {
  return (
    <html lang="es" className={`${karbon.variable} ${roboto.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <AppNav />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
