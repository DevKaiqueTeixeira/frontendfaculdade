"use client";

import type { FormEvent } from "react";
import { removeEmoji } from "@/lib/removeEmoji";
import type { AdditionalFormData } from "@/types/additional";

type AdditionalModalProps = {
  open: boolean;
  productName: string;
  formData: AdditionalFormData;
  submitting: boolean;
  onClose: () => void;
  onChange: (field: keyof AdditionalFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function AdditionalModal({
  open,
  productName,
  formData,
  submitting,
  onClose,
  onChange,
  onSubmit,
}: AdditionalModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(33,14,6,0.45)] p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-[#d8b089]/55 bg-[#fffaf4] p-6 shadow-[0_25px_60px_rgba(23,10,4,0.4)] md:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#a26a45] uppercase">Adicionais</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#5c301b]">Novo adicional</h3>
            <p className="mt-2 text-sm text-[#6d4027]">Produto vinculado: {productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d4aa84]/55 bg-white px-3 py-1.5 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-[#e4c7ac] bg-white/75 p-4">
          <label className="flex flex-col gap-1 text-sm text-[#5f311d]">
            <span className="font-medium">Nome do adicional</span>
            <input
              value={formData.nome}
              onChange={(event) => onChange("nome", removeEmoji(event.target.value))}
              placeholder="Digite o nome do adicional"
              required
              className="rounded-xl border border-[#9a6545]/30 bg-[#fffefc] px-3 py-2.5 text-[#3f1f11] outline-none transition focus:border-[#7a3f22] focus:ring-4 focus:ring-[#d0a489]/35"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#5f311d]">
            <span className="font-medium">Preço do adicional</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={formData.preco}
              onChange={(event) => onChange("preco", removeEmoji(event.target.value))}
              required
              className="rounded-xl border border-[#9a6545]/30 bg-[#fffefc] px-3 py-2.5 text-[#3f1f11] outline-none transition focus:border-[#7a3f22] focus:ring-4 focus:ring-[#d0a489]/35"
            />
          </label>

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
              disabled={submitting}
              className="rounded-xl border border-[#6a3a21] bg-[#6a3a21] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f2a18] disabled:cursor-not-allowed disabled:border-[#b58f71] disabled:bg-[#b58f71]"
            >
              {submitting ? "Salvando adicional..." : "Salvar adicional"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
