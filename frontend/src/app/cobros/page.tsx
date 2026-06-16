import CobroRow from "@/components/CobroRow"
import FiltroEstado from "@/components/FiltroEstado"
import NuevoCobroForm from "@/components/NuevoCobroForm"
import { api } from "@/lib/api"
import type { Collection, EstadoCobro, Paginated } from "@/lib/types"

import { CobrosList, EmptyState, Header, HeaderActions, Page, Title } from "./ui"

const ESTADOS_VALIDOS: readonly EstadoCobro[] = ["pendiente", "parcial", "pagado"]

function parseEstado(raw: string | string[] | undefined): EstadoCobro | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  return ESTADOS_VALIDOS.find((e) => e === value) ?? null
}

type Props = {
  readonly searchParams: { readonly estado?: string | string[] }
}

export default async function CobrosPage({ searchParams }: Props): Promise<JSX.Element> {
  const estado = parseEstado(searchParams.estado)
  const query = estado ? `?estado=${estado}` : ""
  const data = await api.get<Paginated<Collection>>(`/collections/${query}`)

  return (
    <Page>
      <Header>
        <Title>Cobros</Title>
        <HeaderActions>
          <FiltroEstado estado={estado} />
          <NuevoCobroForm />
        </HeaderActions>
      </Header>

      {data.results.length === 0 ? (
        <EmptyState>
          {estado
            ? `No hay cobros ${estado === "parcial" ? "parciales" : `${estado}s`}.`
            : "Aún no hay cobros. Crea el primero con “Nuevo cobro”."}
        </EmptyState>
      ) : (
        <CobrosList>
          {data.results.map((cobro) => (
            <CobroRow key={cobro.collection_id} cobro={cobro} />
          ))}
        </CobrosList>
      )}
    </Page>
  )
}
