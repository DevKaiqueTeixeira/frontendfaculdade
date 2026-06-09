"use client";

import { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { removeEmoji } from "@/lib/removeEmoji";
import { notify } from "@/services/notify";
import { atualizarEndereco, buscarEnderecos, cadastrarEndereco, excluirEndereco } from "@/services/address.service";
import type { AddressFormData, AddressModalMode, AddressPreview } from "@/types/address";

const initialFormData: AddressFormData = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "Brasil",
  pontoReferencia: "",
  tipoEndereco: "Residencial",
};

export function useAddressStore() {
  const [addresses, setAddresses] = useState<AddressPreview[]>([]);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AddressModalMode>("create");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

  const canSubmit = useMemo(() => !submitting, [submitting]);
  const canAddMore = useMemo(() => addresses.length < 2, [addresses.length]);

  function setField(field: keyof AddressFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: removeEmoji(value) }));
  }

  function openCreateModal() {
    if (!canAddMore) {
      notify.info("Voce ja cadastrou os 2 enderecos permitidos.");
      return;
    }

    setModalMode("create");
    setEditingAddressId(null);
    setFormData(initialFormData);
    setModalOpen(true);
  }

  function openEditModal(address: AddressPreview) {
    setModalMode("edit");
    setEditingAddressId(address.id);
    setFormData(normalizeFormData({
      cep: address.cep,
      logradouro: address.logradouro,
      numero: address.numero,
      complemento: address.complemento,
      bairro: address.bairro,
      cidade: address.cidade,
      estado: address.estado,
      pais: address.pais,
      pontoReferencia: address.pontoReferencia,
      tipoEndereco: address.tipoEndereco,
    }));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalMode("create");
    setEditingAddressId(null);
    setFormData(initialFormData);
  }

  async function loadAddresses(supabase: SupabaseClient | null, silent = false): Promise<AddressPreview[] | null> {
    if (!supabase) {
      if (!silent) {
        notify.error("Sessao do usuario indisponivel para carregar enderecos.");
      }

      return null;
    }

    try {
      setLoading(true);
      const accessToken = await getAccessToken(supabase);
      const nextAddresses = await buscarEnderecos(accessToken);
      setAddresses(nextAddresses);
      return nextAddresses;
    } catch (error) {
      setAddresses([]);

      if (!silent) {
        notify.error(getErrorMessage(error, "Nao foi possivel carregar os enderecos."));
      }

      return null;
    } finally {
      setLoading(false);
    }
  }

  async function submitAddress(supabase: SupabaseClient | null): Promise<AddressPreview[] | null> {
    const normalizedFormData = normalizeFormData(formData);
    const validationError = validateFormData(normalizedFormData);

    setFormData(normalizedFormData);

    if (validationError) {
      notify.error(validationError);
      return null;
    }

    if (!supabase) {
      notify.error("Sessao do usuario indisponivel para cadastrar endereco.");
      return null;
    }

    if (modalMode === "create" && !canAddMore) {
      notify.info("Voce ja cadastrou os 2 enderecos permitidos.");
      return null;
    }

    try {
      setSubmitting(true);
      const accessToken = await getAccessToken(supabase);
      const response = modalMode === "edit" && editingAddressId !== null
        ? await atualizarEndereco(editingAddressId, normalizedFormData, accessToken)
        : await cadastrarEndereco(normalizedFormData, accessToken);

      const nextAddress = modalMode === "edit" && editingAddressId !== null
        ? { ...normalizedFormData, id: editingAddressId }
        : { ...normalizedFormData, id: response.id };

      const nextAddresses = modalMode === "edit" && editingAddressId !== null
        ? addresses.map((address) => address.id === editingAddressId ? nextAddress : address)
        : [nextAddress, ...addresses].slice(0, 2);

      setAddresses(nextAddresses);
      setFormData(initialFormData);
      setModalOpen(false);
      setModalMode("create");
      setEditingAddressId(null);
      notify.success(response.mensagem);
      return nextAddresses;
    } catch (error) {
      notify.error(getErrorMessage(error, modalMode === "edit" ? "Nao foi possivel atualizar o endereco." : "Nao foi possivel cadastrar o endereco."));
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  function deleteAddress(supabase: SupabaseClient | null, id: number): void {
    notify.confirm("Tem certeza que deseja excluir este endereco?", () => {
      void performDeleteAddress(supabase, id);
    });
  }

  async function performDeleteAddress(supabase: SupabaseClient | null, id: number): Promise<boolean> {
    if (!supabase) {
      notify.error("Sessao do usuario indisponivel para excluir endereco.");
      return false;
    }

    try {
      setDeletingAddressId(id);
      const accessToken = await getAccessToken(supabase);
      const response = await excluirEndereco(id, accessToken);
      setAddresses((prev) => prev.filter((address) => address.id !== id));

      if (editingAddressId === id) {
        closeModal();
      }

      notify.success(response.mensagem);
      return true;
    } catch (error) {
      notify.error(getErrorMessage(error, "Nao foi possivel excluir o endereco."));
      return false;
    } finally {
      setDeletingAddressId(null);
    }
  }

  return {
    addresses,
    canAddMore,
    canSubmit,
    deletingAddressId,
    deleteAddress,
    editingAddressId,
    formData,
    loading,
    loadAddresses,
    modalOpen,
    modalMode,
    closeModal,
    openCreateModal,
    openEditModal,
    setField,
    submitAddress,
    submitting,
  };
}

async function getAccessToken(supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  return accessToken;
}

function normalizeFormData(formData: AddressFormData): AddressFormData {
  return {
    cep: removeEmoji(formData.cep).replace(/\D/g, ""),
    logradouro: removeEmoji(formData.logradouro).trim(),
    numero: removeEmoji(formData.numero).trim(),
    complemento: removeEmoji(formData.complemento).trim(),
    bairro: removeEmoji(formData.bairro).trim(),
    cidade: removeEmoji(formData.cidade).trim(),
    estado: removeEmoji(formData.estado).trim().toUpperCase(),
    pais: removeEmoji(formData.pais).trim(),
    pontoReferencia: removeEmoji(formData.pontoReferencia).trim(),
    tipoEndereco: removeEmoji(formData.tipoEndereco).trim(),
  };
}

function validateFormData(formData: AddressFormData): string {
  if (!formData.cep || !formData.logradouro || !formData.numero || !formData.bairro || !formData.cidade || !formData.estado || !formData.pais || !formData.tipoEndereco) {
    return "Preencha todos os campos obrigatorios do endereco.";
  }

  if (formData.cep.length !== 8) {
    return "CEP invalido.";
  }

  if (formData.estado.length !== 2) {
    return "Estado invalido.";
  }

  return "";
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}
