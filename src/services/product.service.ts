import { buildApiUrl, parseApiError } from "@/services/api";
import type { CadastroResponse } from "@/types/cadastro";
import type { ProductPayload, ProductPreview } from "@/types/product";

export function buildProductImageUrl(imagemUrl?: string | null) {
  if (!imagemUrl) {
    return null;
  }

  if (imagemUrl.startsWith("http://") || imagemUrl.startsWith("https://")) {
    return imagemUrl;
  }

  return buildApiUrl(imagemUrl);
}

function buildProductFormData(payload: ProductPayload) {
  const formData = new FormData();
  formData.append("nome", payload.nome);
  formData.append("preco", payload.preco.toFixed(2));

  if (payload.imagem) {
    formData.append("imagem", payload.imagem);
  }

  return formData;
}

export async function buscarProdutos(accessToken?: string): Promise<ProductPreview[]> {
  const headers = accessToken
    ? {
      Authorization: `Bearer ${accessToken}`,
    }
    : undefined;

  const response = await fetch(buildApiUrl("/produtos"), {
    method: "GET",
    headers,
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
      Authorization: `Bearer ${accessToken}`,
    },
    body: buildProductFormData(payload),
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
      Authorization: `Bearer ${accessToken}`,
    },
    body: buildProductFormData(payload),
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
