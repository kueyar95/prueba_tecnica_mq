import CobroRow from "@/components/CobroRow"
import FiltroEstado from "@/components/FiltroEstado"
import NuevoCobroForm from "@/components/NuevoCobroForm"
import Pagination from "@/components/Pagination"
import { api } from "@/lib/api"
import type { Collection, EstadoCobro, Paginated } from "@/lib/types"

import { CobrosList, EmptyState, Header, HeaderActions, Page, Title } from "./ui"

// Debe coincidir con DRF PageNumberPagination PAGE_SIZE del backend.
const PAGE_SIZE = 25
const ESTADOS_VALIDOS: readonly EstadoCobro[] = ["pendiente", "parcial", "pagado"]

function parseEstado(raw: string | string[] | undefined): EstadoCobro | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  return ESTADOS_VALIDOS.find((e) => e === value) ?? null
}

function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 ? n : 1
}

type Props = {
  readonly searchParams: {
    readonly estado?: string | string[]
    readonly page?: string | string[]
  }
}

export default async function CobrosPage({ searchParams }: Props): Promise<JSX.Element> {
  const estado = parseEstado(searchParams.estado)
  const page = parsePage(searchParams.page)
  const params = new URLSearchParams()
  if (estado) {
    params.set("estado", estado)
  }
  if (page > 1) {
    params.set("page", String(page))
  }
  const query = params.toString()
  const data = await api.get<Paginated<Collection>>(
    query ? `/collections/?${query}` : "/collections/",
  )

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
        <>
          <CobrosList>
            {data.results.map((cobro) => (
              <CobroRow key={cobro.collection_id} cobro={cobro} />
            ))}
          </CobrosList>
          <Pagination
            basePath="/cobros"
            page={page}
            count={data.count}
            pageSize={PAGE_SIZE}
            hasNext={data.next !== null}
            hasPrevious={data.previous !== null}
            extraParams={estado ? { estado } : {}}
          />
        </>
      )}
    </Page>
  )
}
