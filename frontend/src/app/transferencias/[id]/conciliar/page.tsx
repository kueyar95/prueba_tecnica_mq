import { notFound } from "next/navigation"

import { api, ApiClientError } from "@/lib/api"
import type { BankMovementDetail, Collection, Paginated } from "@/lib/types"

import ConciliarForm from "@/components/ConciliarForm"

type Props = {
  readonly params: { readonly id: string }
}

export default async function ConciliarPage({ params }: Props): Promise<JSX.Element> {
  let movement: BankMovementDetail
  try {
    movement = await api.get<BankMovementDetail>(`/bank-movements/${params.id}/`)
  } catch (e) {
    if (e instanceof ApiClientError && e.status === 404) {
      notFound()
    }
    throw e
  }

  // Cobros con saldo por cubrir: pendientes + parciales. La API no expone un
  // único filtro para ambos, así que se piden por separado y se combinan.
  const [pendientes, parciales] = await Promise.all([
    api.get<Paginated<Collection>>("/collections/?estado=pendiente"),
    api.get<Paginated<Collection>>("/collections/?estado=parcial"),
  ])
  const cobros: Collection[] = [...pendientes.results, ...parciales.results]

  return <ConciliarForm movement={movement} cobros={cobros} />
}
