export type Moneda = "CLP" | "UF"
export type EstadoCobro = "pendiente" | "parcial" | "pagado"

export interface Abono {
  abono_id: number
  bank_movement: number
  collection: number
  monto: string
  created_at: string
}
export interface Devolucion {
  devolucion_id: number
  bank_movement: number
  monto: string
  fecha: string
  motivo: string
  created_at: string
}
export interface Collection {
  collection_id: number
  contract_id: number
  mes_cobro: string
  monto_cobro: string
  moneda: Moneda
  equivalente_clp: string
  faltante_clp: string
  estado: EstadoCobro
  created_at: string
  updated_at: string
}
export interface CollectionDetail extends Collection {
  abonos: Abono[]
}
export interface BankMovement {
  bank_movement_id: number
  fecha: string
  glosa: string
  monto: string
  pagador: string
  saldo_disponible: string
  created_at: string
  updated_at: string
}
export interface BankMovementDetail extends BankMovement {
  abonos: Abono[]
  devoluciones: Devolucion[]
}
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
export interface ApiError {
  error: { code: string; message: string; details: Record<string, unknown> }
}
