"use client";

import { useMemo, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { notify } from "@/services/notify";
import {
  atualizarPerfil,
  recarregarUsuarioAutenticado,
} from "@/services/profile.service";
import type { ProfileFormData } from "@/types/profile";

const initialFormData: ProfileFormData = {
  authUserId: "",
  nome: "",
  cpf: "",
  email: "",
  dataNascimento: "",
};

type UpdateProfileResult = {
  backendUpdated: boolean;
  sessionSynced: boolean;
  syncedUser: User | null;
  profile: ProfileFormData;
};

export function useProfileStore() {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => !loading, [loading]);

  function setField(field: keyof ProfileFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function loadFromProfile(profile: ProfileFormData) {
    setFormData(profile);
  }

  async function submitProfile(supabase: SupabaseClient | null): Promise<UpdateProfileResult | null> {
    const normalizedFormData = normalizeFormData(formData);
    const validationError = validateFormData(normalizedFormData);

    setFormData(normalizedFormData);

    if (validationError) {
      notify.error(validationError);
      return null;
    }

    if (!supabase) {
      notify.error("Sessao do usuario indisponivel para sincronizacao.");
      return null;
    }

    try {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      const response = await atualizarPerfil(normalizedFormData, accessToken);
      let syncedUser: User | null = null;

      try {
        syncedUser = await recarregarUsuarioAutenticado(supabase);
      } catch (syncError) {
        notify.info(`Perfil atualizado. Faca login novamente para recarregar a sessao: ${getErrorMessage(syncError)}`);
      }

      if (response.mensagem === "Nenhum dado foi alterado.") {
        notify.info(response.mensagem);
      } else {
        notify.success(response.mensagem);
      }

      return {
        backendUpdated: true,
        sessionSynced: Boolean(syncedUser),
        syncedUser,
        profile: normalizedFormData,
      };
    } catch (error) {
      notify.error(getErrorMessage(error, "Nao foi possivel atualizar o perfil."));
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    canSubmit,
    formData,
    loadFromProfile,
    loading,
    setField,
    submitProfile,
  };
}

function normalizeFormData(formData: ProfileFormData): ProfileFormData {
  return {
    authUserId: formData.authUserId.trim(),
    nome: formData.nome.trim(),
    cpf: normalizeCpf(formData.cpf),
    email: formData.email.trim().toLowerCase(),
    dataNascimento: formData.dataNascimento.trim(),
  };
}

function validateFormData(formData: ProfileFormData): string {
  if (!formData.authUserId) {
    return "Usuario autenticado nao encontrado.";
  }

  if (!formData.nome || !formData.cpf || !formData.email || !formData.dataNascimento) {
    return "Preencha todos os dados antes de atualizar.";
  }

  if (formData.cpf.length !== 11) {
    return "CPF invalido.";
  }

  return "";
}

function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

function getErrorMessage(error: unknown, fallbackMessage = "Erro inesperado."): string {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}
