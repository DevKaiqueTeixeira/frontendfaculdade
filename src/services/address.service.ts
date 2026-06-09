import { buildApiUrl, parseApiError } from "@/services/api";
import type { CadastroResponse } from "@/types/cadastro";
import type { AddressPayload, AddressPreview } from "@/types/address";

export async function buscarEnderecos(accessToken: string): Promise<AddressPreview[]> {
  const response = await fetch(buildApiUrl("/enderecos"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao carregar enderecos."));
  }

  return (await response.json()) as AddressPreview[];
}

export async function cadastrarEndereco(payload: AddressPayload, accessToken: string): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl("/enderecos"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao cadastrar endereco."));
  }

  return (await response.json()) as CadastroResponse;
}

export async function atualizarEndereco(id: number, payload: AddressPayload, accessToken: string): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl(`/enderecos/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao atualizar endereco."));
  }

  return (await response.json()) as CadastroResponse;
}

export async function excluirEndereco(id: number, accessToken: string): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl(`/enderecos/${id}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao excluir endereco."));
  }

  return (await response.json()) as CadastroResponse;
}
