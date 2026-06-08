"use client";

import type { FormEvent, ReactNode } from "react";
import { Home, MapPin } from "lucide-react";
import type { AddressFormData, AddressModalMode } from "@/types/address";

type AddressModalProps = {
  open: boolean;
  formData: AddressFormData;
  mode: AddressModalMode;
  submitting: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onChange: (field: keyof AddressFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function AddressModal({
  open,
  formData,
  mode,
  submitting,
  canSubmit,
  onClose,
  onChange,
  onSubmit,
}: AddressModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(33,14,6,0.45)] p-4 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#d8b089]/55 bg-[#fffaf4] p-6 shadow-[0_25px_60px_rgba(23,10,4,0.4)] md:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-3xl text-[#5c301b]">{mode === "edit" ? "Editar Endereço" : "Adicionar Endereço"}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d4aa84]/55 bg-white px-3 py-1.5 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-3xl border border-[#e4c7ac] bg-white/75 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="CEP"
              value={formData.cep}
              icon={<MapPin className="h-4 w-4" />}
              onChange={(value) => onChange("cep", value)}
            />
            <Field
              label="Tipo do endereço"
              value={formData.tipoEndereco}
              icon={<Home className="h-4 w-4" />}
              onChange={(value) => onChange("tipoEndereco", value)}
            />
            <Field
              label="Logradouro"
              value={formData.logradouro}
              onChange={(value) => onChange("logradouro", value)}
            />
            <Field
              label="Número"
              value={formData.numero}
              onChange={(value) => onChange("numero", value)}
            />
            <Field
              label="Complemento"
              value={formData.complemento}
              required={false}
              onChange={(value) => onChange("complemento", value)}
            />
            <Field
              label="Bairro"
              value={formData.bairro}
              onChange={(value) => onChange("bairro", value)}
            />
            <Field
              label="Cidade"
              value={formData.cidade}
              onChange={(value) => onChange("cidade", value)}
            />
            <Field
              label="Estado"
              value={formData.estado}
              onChange={(value) => onChange("estado", value)}
            />
            <Field
              label="País"
              value={formData.pais}
              onChange={(value) => onChange("pais", value)}
            />
            <Field
              label="Ponto de referência"
              value={formData.pontoReferencia}
              required={false}
              onChange={(value) => onChange("pontoReferencia", value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#c39a79] bg-white px-4 py-2 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#fff4e8]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl border border-[#6a3a21] bg-[#6a3a21] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f2a18] disabled:cursor-not-allowed disabled:border-[#b58f71] disabled:bg-[#b58f71]"
            >
              {submitting ? (mode === "edit" ? "Atualizando endereço..." : "Salvando endereço...") : (mode === "edit" ? "Atualizar" : "Salvar endereço")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  required?: boolean;
};

function Field({ label, value, onChange, icon, required = true }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[#5f311d]">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-[#9a6545]/30 bg-[#fffefc] px-3 py-2.5">
        {icon}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="w-full bg-transparent text-[#3f1f11] outline-none"
        />
      </div>
    </label>
  );
}
