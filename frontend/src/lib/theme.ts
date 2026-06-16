export const theme = {
  color: {
    navy: "#213A58", navyDeep: "#071A2F", teal: "#00B0CA",
    bg: "#F2F2F2", surface: "#FFFFFF", border: "#DEE2E6",
    ink: "#212529", muted: "#818C99",
    pagado: "#198754", parcial: "#C77D11", pendiente: "#818C99", error: "#DC3545",
  },
  font: {
    display: "var(--font-karbon), var(--font-roboto), system-ui, sans-serif",
    body: "var(--font-roboto), system-ui, sans-serif",
  },
} as const

export type Theme = typeof theme
