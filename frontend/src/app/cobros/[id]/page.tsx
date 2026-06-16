import { notFound } from "next/navigation"

import { api, ApiClientError } from "@/lib/api"
import type { CollectionDetail } from "@/lib/types"

import CobroDetalle from "./ui"

type Props = {
  readonly params: { readonly id: string }
}

export default async function CobroDetallePage({ params }: Props): Promise<JSX.Element> {
  let cobro: CollectionDetail
  try {
    cobro = await api.get<CollectionDetail>(`/collections/${params.id}/`)
  } catch (e) {
    if (e instanceof ApiClientError && e.status === 404) {
      notFound()
    }
    throw e
  }

  return <CobroDetalle cobro={cobro} />
}
