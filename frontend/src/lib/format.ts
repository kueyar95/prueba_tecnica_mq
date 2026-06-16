const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
})
export const formatCLP = (monto: string | number): string => clp.format(Number(monto))
export const formatUF = (monto: string | number): string =>
  `UF ${new Intl.NumberFormat("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(monto))}`
