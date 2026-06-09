"use client";

import type { FormEvent, ReactNode } from "react";
import { CalendarDays, Home, IdCard, Mail, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { removeEmoji } from "@/lib/removeEmoji";
import type { AddressPreview } from "@/types/address";
import type { ProfileFormData } from "@/types/profile";

type ProfileModalProps = {
  open: boolean;
  formData: ProfileFormData;
  addresses: AddressPreview[];
  addressLoading: boolean;
  canAddMoreAddresses: boolean;
  deletingAddressId: number | null;
  loading: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onAddressOpen: () => void;
  onAddressDelete: (id: number) => void;
  onAddressEdit: (address: AddressPreview) => void;
  onChange: (field: keyof ProfileFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ProfileModal({
  open,
  formData,
  addresses,
  addressLoading,
  canAddMoreAddresses,
  deletingAddressId,
  loading,
  canSubmit,
  onClose,
  onAddressOpen,
  onAddressDelete,
  onAddressEdit,
  onChange,
  onSubmit,
}: ProfileModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(33,14,6,0.45)] p-4 backdrop-blur-md">
      <div className="max-h-[96vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-[#d8b089]/55 bg-[#fffaf4] p-5 shadow-[0_25px_60px_rgba(23,10,4,0.4)] md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-[#5c301b]">Meu Perfil</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d4aa84]/55 bg-white px-3 py-1.5 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Nome"
              value={formData.nome}
              icon={<UserRound className="h-4 w-4" />}
              onChange={(value) => onChange("nome", value)}
            />
            <Field
              label="Email"
              type="email"
              value={formData.email}
              icon={<Mail className="h-4 w-4" />}
              onChange={(value) => onChange("email", value)}
            />
            <Field
              label="Data de nascimento"
              type="date"
              value={formData.dataNascimento}
              icon={<CalendarDays className="h-4 w-4" />}
              onChange={(value) => onChange("dataNascimento", value)}
            />
            <Field
              label="CPF"
              value={formData.cpf}
              icon={<IdCard className="h-4 w-4" />}
              onChange={(value) => onChange("cpf", value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl border border-[#6a3a21] bg-[#6a3a21] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f2a18] disabled:cursor-not-allowed disabled:border-[#b58f71] disabled:bg-[#b58f71]"
            >
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </form>

        <section className="mt-5 border-t border-[#d9b38d]/45 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6644]">Endereços cadastrados</p>
            <p className="text-xs text-[#8c6043]">Máximo de 2 endereços</p>
          </div>

          {addressLoading ? (
            <p className="rounded-2xl border border-[#e4c7ac] bg-white px-4 py-3 text-sm text-[#7a4b32]">Carregando endereços...</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 2 }, (_, index) => {
                const address = addresses[index];

                if (address) {
                  return (
                    <article
                      key={address.id}
                      className="relative rounded-2xl border border-[#e4c7ac] bg-white p-4 text-sm text-[#5a311f] shadow-[0_10px_24px_rgba(64,34,18,0.08)]"
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onAddressEdit(address)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100"
                          aria-label="Editar endereço"
                          title="Editar endereço"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddressDelete(address.id)}
                          disabled={deletingAddressId === address.id}
                          className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Excluir endereço"
                          title="Excluir endereço"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="pr-24">
                        <div className="flex items-center gap-2 text-[#7a3f22]">
                          <Home className="h-4 w-4" />
                          <p className="font-semibold">{address.tipoEndereco}</p>
                        </div>
                        <p className="mt-2 font-medium">{address.logradouro}, {address.numero}</p>
                        <p>{address.bairro} - {address.cidade}/{address.estado}</p>
                        <p>CEP {formatCep(address.cep)} • {address.pais}</p>
                        {address.complemento && <p>Complemento: {address.complemento}</p>}
                        {address.pontoReferencia && <p>Referência: {address.pontoReferencia}</p>}
                      </div>
                    </article>
                  );
                }

                return (
                  <button
                    key={`empty-slot-${index}`}
                    type="button"
                    onClick={onAddressOpen}
                    disabled={!canAddMoreAddresses}
                    className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-[#b07652] bg-white px-4 py-5 text-center text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#fff4e8] disabled:cursor-not-allowed disabled:opacity-60 md:min-h-48"
                  >
                    <Plus className="h-8 w-8" />
                    <span className="mt-2 text-sm font-semibold">Adicionar endereço</span>
                    <span className="mt-1 text-xs text-[#8c6043]">{index === 0 ? "Lado esquerdo" : "Lado direito"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  type?: "text" | "email" | "date";
};

function Field({ label, value, onChange, icon, type = "text" }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[#5f311d]">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-[#9a6545]/30 bg-[#fffefc] px-3 py-2.5">
        {icon}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(removeEmoji(event.target.value))}
          required
          className="w-full bg-transparent text-[#3f1f11] outline-none"
        />
      </div>
    </label>
  );
}

function formatCep(cep: string) {
  const digits = cep.replace(/\D/g, "");

  if (digits.length !== 8) {
    return cep;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
