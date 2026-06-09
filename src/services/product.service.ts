import { buildApiUrl, parseApiError } from "@/services/api";
import type { CadastroResponse } from "@/types/cadastro";
import type { ProductPayload, ProductPreview } from "@/types/product";

export async function buscarProdutos(accessToken: string): Promise<ProductPreview[]> {
  const response = await fetch(buildApiUrl("/produtos"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao carregar produtos."));
  }

  return (await response.json()) as ProductPreview[];
}

export async function cadastrarProduto(payload: ProductPayload, accessToken: string): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl("/produtos"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao cadastrar produto."));
  }

  return (await response.json()) as CadastroResponse;
}

export async function atualizarProduto(id: number, payload: ProductPayload, accessToken: string): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl(`/produtos/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao atualizar produto."));
  }

  return (await response.json()) as CadastroResponse;
}

export async function excluirProduto(id: number, accessToken: string): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl(`/produtos/${id}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao excluir produto."));
  }

  return (await response.json()) as CadastroResponse;
}
