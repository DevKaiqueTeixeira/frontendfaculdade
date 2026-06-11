"use client";

import { MapPin, ShoppingBag } from "lucide-react";
import { buildProductImageUrl } from "@/services/product.service";
import type { AddressPreview } from "@/types/address";
import type { AdditionalPreview } from "@/types/additional";
import type { ProductPreview } from "@/types/product";

type OrderModalProps = {
  open: boolean;
  product: ProductPreview | null;
  additionals: AdditionalPreview[];
  additionalsLoading: boolean;
  addresses: AddressPreview[];
  selectedAdditionalIds: number[];
  selectedAddressId: number | null;
  submitting: boolean;
  onClose: () => void;
  onToggleAdditional: (additionalId: number) => void;
  onSelectAddress: (addressId: number) => void;
  onSubmit: () => void;
};

export default function OrderModal({
  open,
  product,
  additionals,
  additionalsLoading,
  addresses,
  selectedAdditionalIds,
  selectedAddressId,
  submitting,
  onClose,
  onToggleAdditional,
  onSelectAddress,
  onSubmit,
}: OrderModalProps) {
  if (!open || !product) {
    return null;
  }

  const imageUrl = buildProductImageUrl(product.imagemUrl);
  const selectedAdditionals = additionals.filter((additional) => selectedAdditionalIds.includes(additional.id));
  const additionalTotal = selectedAdditionals.reduce((total, additional) => total + additional.preco, 0);
  const total = product.preco + additionalTotal;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(33,14,6,0.52)] p-4 backdrop-blur-md">
      <div className="max-h-[96vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#d8b089]/55 bg-[#fffaf4] p-5 shadow-[0_25px_60px_rgba(23,10,4,0.4)] md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#9b6644] uppercase">Montar pedido</p>
            <h2 className="font-display mt-2 text-3xl text-[#5c301b]">{product.nome}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d4aa84]/55 bg-white px-3 py-1.5 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
          >
            Fechar
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-[#e4c7ac] bg-white p-4 shadow-[0_12px_28px_rgba(64,34,18,0.08)]">
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e6c7a9] bg-[#fff7ef]">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.nome} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag className="h-8 w-8 text-[#8a5332]" />
                )}
              </div>
              <div>
                <p className="text-sm text-[#8a5332]">Produto selecionado</p>
                <p className="text-xl font-semibold text-[#4b2616]">{product.nome}</p>
                <p className="mt-1 text-sm font-semibold text-[#6a3a21]">R$ {formatCurrency(product.preco)}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#9b6644] uppercase">Adicionais</p>
                  <p className="mt-1 text-sm text-[#6d4027]">Escolha os complementos do pedido.</p>
                </div>
                <span className="rounded-full bg-[#f7e4d1] px-3 py-1 text-xs font-semibold text-[#8a5332]">
                  {selectedAdditionals.length} selecionado{selectedAdditionals.length === 1 ? "" : "s"}
                </span>
              </div>

              {additionalsLoading ? (
                <p className="mt-4 text-sm text-[#6d4027]">Carregando adicionais...</p>
              ) : additionals.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-[#ddb58e] bg-[#fffaf4] px-4 py-4 text-sm text-[#6d4027]">
                  Este item nao possui adicionais cadastrados.
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {additionals.map((additional) => {
                    const checked = selectedAdditionalIds.includes(additional.id);

                    return (
                      <label
                        key={additional.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${checked ? "border-[#6a3a21] bg-[#fff1e3]" : "border-[#ead2b7] bg-[#fffaf4] hover:border-[#c78656]"}`}
                      >
                        <div>
                          <p className="font-semibold text-[#4b2616]">{additional.nome}</p>
                          <p className="mt-1 text-sm text-[#8a5332]">R$ {formatCurrency(additional.preco)}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleAdditional(additional.id)}
                          className="h-4 w-4 accent-[#6a3a21]"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-3xl border border-[#ddb58e]/45 bg-[#2e160b] p-5 text-white shadow-[0_16px_34px_rgba(20,8,3,0.22)]">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#d9b38d] uppercase">Entrega</p>
            <div className="mt-4 space-y-3">
              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#f5d1b1]/45 bg-white/6 px-4 py-4 text-sm text-[#f2ddc8]">
                  Cadastre um endereco no seu perfil para conseguir finalizar o pedido.
                </div>
              ) : addresses.map((address) => {
                const selected = selectedAddressId === address.id;

                return (
                  <label
                    key={address.id}
                    className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${selected ? "border-[#f5d1b1] bg-white/12" : "border-white/12 bg-white/6 hover:bg-white/10"}`}
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f5d1b1]/35 bg-white/8 text-[#f7e4d1]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#f7e4d1]">{address.tipoEndereco}</p>
                      <p className="mt-2 break-words text-sm leading-6 text-[#f2ddc8]">{address.logradouro}, {address.numero}</p>
                      <p className="break-words text-sm leading-6 text-[#f2ddc8]">{address.bairro} - {address.cidade}/{address.estado}</p>
                    </div>
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onSelectAddress(address.id)}
                        className="h-4 w-4 shrink-0 accent-[#f0c8a4]"
                      />
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/6 p-4">
              <div className="flex items-center justify-between text-sm text-[#f2ddc8]">
                <span>Produto</span>
                <span>R$ {formatCurrency(product.preco)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-[#f2ddc8]">
                <span>Adicionais</span>
                <span>R$ {formatCurrency(additionalTotal)}</span>
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>R$ {formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || additionalsLoading || addresses.length === 0 || selectedAddressId === null}
              className="mt-5 w-full rounded-2xl border border-[#f0c8a4] bg-[#f0c8a4] px-4 py-3 text-sm font-semibold text-[#4b2616] transition hover:bg-[#f6d8bc] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Finalizando pedido..." : "Finalizar pedido"}
            </button>

            <p className="mt-3 text-xs text-[#f2ddc8]">
              {addresses.length === 0 ? "Voce precisa cadastrar um endereco no perfil antes de finalizar." : "Selecione um dos enderecos cadastrados para vincular ao pedido."}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return value.toFixed(2).replace(".", ",");
}
