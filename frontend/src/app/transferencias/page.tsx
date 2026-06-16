import NuevaTransferenciaForm from "@/components/NuevaTransferenciaForm"
import TransferenciaRow from "@/components/TransferenciaRow"
import { api } from "@/lib/api"
import type { BankMovement, Paginated } from "@/lib/types"

import { EmptyState, Header, HeaderActions, Page, Title, TransferenciasList } from "./ui"

export default async function TransferenciasPage(): Promise<JSX.Element> {
  const data = await api.get<Paginated<BankMovement>>("/bank-movements/")

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
        <TransferenciasList>
          {data.results.map((movimiento) => (
            <TransferenciaRow key={movimiento.bank_movement_id} movimiento={movimiento} />
          ))}
        </TransferenciasList>
      )}
    </Page>
  )
}
