import { notFound } from "next/navigation"

import { api, ApiClientError } from "@/lib/api"
import type { BankMovementDetail } from "@/lib/types"

import TransferenciaDetalle from "./ui"

type Props = {
  readonly params: { readonly id: string }
}

export default async function TransferenciaDetallePage({
  params,
}: Props): Promise<JSX.Element> {
  let movimiento: BankMovementDetail
  try {
    movimiento = await api.get<BankMovementDetail>(`/bank-movements/${params.id}/`)
  } catch (e) {
    if (e instanceof ApiClientError && e.status === 404) {
      notFound()
    }
    throw e
  }

  return <TransferenciaDetalle movimiento={movimiento} />
}
