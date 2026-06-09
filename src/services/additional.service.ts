import { buildApiUrl, parseApiError } from "@/services/api";
import type { CadastroResponse } from "@/types/cadastro";
import type { AdditionalPayload, AdditionalPreview } from "@/types/additional";

export async function buscarAdicionaisPorProduto(produtoId: number, accessToken: string): Promise<AdditionalPreview[]> {
  const response = await fetch(buildApiUrl(`/adicionais/produto/${produtoId}`), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao carregar adicionais."));
  }

  return (await response.json()) as AdditionalPreview[];
}

export async function cadastrarAdicional(payload: AdditionalPayload, accessToken: string): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl("/adicionais"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao cadastrar adicional."));
  }

  return (await response.json()) as CadastroResponse;
}

export async function excluirAdicional(id: number, accessToken: string): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl(`/adicionais/${id}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao excluir adicional."));
  }

  return (await response.json()) as CadastroResponse;
}
