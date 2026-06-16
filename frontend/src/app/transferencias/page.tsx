import NuevaTransferenciaForm from "@/components/NuevaTransferenciaForm"
import Pagination from "@/components/Pagination"
import TransferenciaRow from "@/components/TransferenciaRow"
import { api } from "@/lib/api"
import type { BankMovement, Paginated } from "@/lib/types"

import { EmptyState, Header, HeaderActions, Page, Title, TransferenciasList } from "./ui"

// Debe coincidir con DRF PageNumberPagination PAGE_SIZE del backend.
const PAGE_SIZE = 25

function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 ? n : 1
}

type Props = {
  readonly searchParams: { readonly page?: string | string[] }
}

export default async function TransferenciasPage({
  searchParams,
}: Props): Promise<JSX.Element> {
  const page = parsePage(searchParams.page)
  const data = await api.get<Paginated<BankMovement>>(
    page > 1 ? `/bank-movements/?page=${page}` : "/bank-movements/",
  )

  return (
    <Page>
      <Header>
        <Title>Transferencias</Title>
        <HeaderActions>
          <NuevaTransferenciaForm />
        </HeaderActions>
      </Header>

      {data.results.length === 0 ? (
        <EmptyState>
          Aún no hay transferencias. Registra la primera con “Nueva transferencia”.
        </EmptyState>
      ) : (
        <>
          <TransferenciasList>
            {data.results.map((movimiento) => (
              <TransferenciaRow
                key={movimiento.bank_movement_id}
                movimiento={movimiento}
              />
            ))}
          </TransferenciasList>
          <Pagination
            basePath="/transferencias"
            page={page}
            count={data.count}
            pageSize={PAGE_SIZE}
            hasNext={data.next !== null}
            hasPrevious={data.previous !== null}
          />
        </>
      )}
    </Page>
  )
}
