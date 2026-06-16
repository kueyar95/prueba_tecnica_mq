import localFont from "next/font/local"
import { Roboto } from "next/font/google"

export const karbon = localFont({
  src: [
    { path: "../fonts/karbon/karbon-regular.woff", weight: "400", style: "normal" },
    { path: "../fonts/karbon/karbon-bold.woff", weight: "700", style: "normal" },
  ],
  variable: "--font-karbon",
  display: "swap",
})

export const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
})
