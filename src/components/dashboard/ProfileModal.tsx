"use client";

import type { FormEvent, ReactNode } from "react";
import { CalendarDays, IdCard, Mail, UserRound } from "lucide-react";
import type { ProfileFormData } from "@/types/profile";

type ProfileModalProps = {
  open: boolean;
  formData: ProfileFormData;
  loading: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onChange: (field: keyof ProfileFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ProfileModal({
  open,
  formData,
  loading,
  canSubmit,
  onClose,
  onChange,
  onSubmit,
}: ProfileModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(33,14,6,0.55)] p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#d8b089]/55 bg-[#fffaf4] p-6 shadow-[0_25px_60px_rgba(23,10,4,0.4)]">
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl border border-[#6a3a21] bg-[#6a3a21] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f2a18] disabled:cursor-not-allowed disabled:border-[#b58f71] disabled:bg-[#b58f71]"
            >
              {loading ? "Atualizando..." : "Atualizar"}
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
          onChange={(event) => onChange(event.target.value)}
          required
          className="w-full bg-transparent text-[#3f1f11] outline-none"
        />
      </div>
    </label>
  );
}
