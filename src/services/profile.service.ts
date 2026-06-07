import type { SupabaseClient, User } from "@supabase/supabase-js";
import { buildApiUrl, parseApiError } from "@/services/api";
import type { CadastroResponse } from "@/types/cadastro";
import type { ProfileFormData, ProfileUpdatePayload } from "@/types/profile";

export function criarPerfilDaSessao(user: User | null): ProfileFormData {
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;

  return {
    authUserId: user?.id ?? "",
    nome: typeof metadata.nome === "string" ? metadata.nome : "",
    cpf: typeof metadata.cpf === "string" ? metadata.cpf : "",
    email: user?.email ?? "",
    dataNascimento: typeof metadata.dataNascimento === "string" ? metadata.dataNascimento : "",
  };
}

export async function atualizarPerfil(payload: ProfileUpdatePayload, accessToken: string): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl("/clientes/atualizar"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao atualizar perfil."));
  }

  return (await response.json()) as CadastroResponse;
}

export async function buscarPerfil(accessToken: string): Promise<ProfileFormData> {
  const response = await fetch(buildApiUrl("/clientes/perfil"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao carregar perfil."));
  }

  return (await response.json()) as ProfileFormData;
}

export async function recarregarUsuarioAutenticado(
  supabase: SupabaseClient,
): Promise<User> {
  const refreshResult = await supabase.auth.refreshSession();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error(refreshResult.error?.message || "Nao foi possivel atualizar a sessao do usuario.");
  }

  return data.user;
}
