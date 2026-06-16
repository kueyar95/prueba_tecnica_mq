"use client"

import { useEffect, useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import styled from "styled-components"

import { crearTransferencia, type ActionResult } from "@/app/actions"

type FormState = ActionResult | null

async function submitTransferencia(_prev: FormState, formData: FormData): Promise<FormState> {
  return crearTransferencia({
    fecha: String(formData.get("fecha") ?? ""),
    glosa: String(formData.get("glosa") ?? ""),
    monto: String(formData.get("monto") ?? ""),
    pagador: String(formData.get("pagador") ?? ""),
  })
}

const TriggerButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.color.teal};
  color: #ffffff;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 0.9375rem;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.05s ease;

  &:hover {
    background: #009bb2;
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.navy};
    outline-offset: 2px;
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4rem 1rem 2rem;
  background: rgba(7, 26, 47, 0.55);
  overflow-y: auto;
`

const Modal = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.color.surface};
  border-radius: 10px;
  box-shadow: 0 18px 48px rgba(7, 26, 47, 0.3);
  overflow: hidden;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.125rem 1.5rem;
  background: ${({ theme }) => theme.color.navy};
  color: #ffffff;
`

const ModalTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 1.125rem;
`

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #ffffff;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.teal};
    outline-offset: 2px;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.ink};
`

const Input = styled.input`
  padding: 0.5625rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.9375rem;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.ink};
  background: ${({ theme }) => theme.color.surface};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.teal};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.color.teal}33;
  }
`

const ErrorBanner = styled.p`
  margin: 0;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.color.error}14;
  border: 1px solid ${({ theme }) => theme.color.error}55;
  color: ${({ theme }) => theme.color.error};
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.8125rem;
  font-weight: 500;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
  margin-top: 0.25rem;
`

const Cancel = styled.button`
  padding: 0.5625rem 1rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.ink};
  font-family: ${({ theme }) => theme.font.body};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.color.bg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.navy};
    outline-offset: 2px;
  }
`

const Submit = styled.button`
  padding: 0.5625rem 1.125rem;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.color.teal};
  color: #ffffff;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #009bb2;
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.navy};
    outline-offset: 2px;
  }
`

function SubmitButton(): JSX.Element {
  const { pending } = useFormStatus()
  return (
    <Submit type="submit" disabled={pending}>
      {pending ? "Registrando…" : "Registrar transferencia"}
    </Submit>
  )
}

export default function NuevaTransferenciaForm(): JSX.Element {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState<FormState, FormData>(submitTransferencia, null)
  const titleId = "nueva-transferencia-titulo"
  const closeRef = useRef<HTMLButtonElement>(null)

  // Al crear con éxito, cerrar el modal (la lista se revalida desde la action).
  useEffect(() => {
    if (state?.ok) setOpen(false)
  }, [state])

  // Cerrar con la tecla Escape mientras el modal está abierto.
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <TriggerButton type="button" onClick={() => setOpen(true)}>
        + Nueva transferencia
      </TriggerButton>

      {open ? (
        <Overlay
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <Modal role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <ModalHeader>
              <ModalTitle id={titleId}>Nueva transferencia</ModalTitle>
              <CloseButton
                ref={closeRef}
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
              >
                ×
              </CloseButton>
            </ModalHeader>
            <Form action={formAction}>
              {state && !state.ok ? (
                <ErrorBanner role="alert">{state.error}</ErrorBanner>
              ) : null}

              <Field>
                Fecha
                <Input type="date" name="fecha" required />
              </Field>

              <Field>
                Pagador
                <Input
                  type="text"
                  name="pagador"
                  maxLength={120}
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </Field>

              <Field>
                Glosa
                <Input
                  type="text"
                  name="glosa"
                  maxLength={200}
                  placeholder="Ej. Transferencia arriendo marzo"
                  required
                />
              </Field>

              <Field>
                Monto
                <Input
                  type="number"
                  name="monto"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Ej. 350000"
                  required
                />
              </Field>

              <Actions>
                <Cancel type="button" onClick={() => setOpen(false)}>
                  Cancelar
                </Cancel>
                <SubmitButton />
              </Actions>
            </Form>
          </Modal>
        </Overlay>
      ) : null}
    </>
  )
}
