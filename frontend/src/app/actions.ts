"use server"
import { revalidatePath } from "next/cache"

import { api, ApiClientError } from "@/lib/api"
import type { Collection, BankMovement } from "@/lib/types"

export type ActionResult = { ok: true } | { ok: false; error: string }

function fail(e: unknown): ActionResult {
  if (e instanceof ApiClientError) return { ok: false, error: e.message }
  return { ok: false, error: "Error inesperado" }
}

export async function crearCobro(data: {
  contract_id: number
  mes_cobro: string
  monto_cobro: string
  moneda: "CLP" | "UF"
}): Promise<ActionResult> {
  try {
    await api.post<Collection>("/collections/", data)
    revalidatePath("/cobros")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function crearTransferencia(data: {
  fecha: string
  glosa: string
  monto: string
  pagador: string
}): Promise<ActionResult> {
  try {
    await api.post<BankMovement>("/bank-movements/", data)
    revalidatePath("/transferencias")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function conciliar(
  movimientoId: number,
  asignaciones: { collection_id: number; monto: string }[],
): Promise<ActionResult> {
  try {
    await api.post(`/bank-movements/${movimientoId}/abonos/`, { asignaciones })
    revalidatePath("/transferencias")
    revalidatePath("/cobros")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function devolver(
  movimientoId: number,
  data: { monto: string; motivo: string; fecha: string },
): Promise<ActionResult> {
  try {
    await api.post(`/bank-movements/${movimientoId}/devoluciones/`, data)
    revalidatePath("/transferencias")
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
