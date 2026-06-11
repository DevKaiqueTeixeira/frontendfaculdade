import { buildApiUrl, parseApiError } from "@/services/api";
import type { OrderPayload, OrderPreview } from "@/types/order";

export async function buscarPedidos(accessToken: string): Promise<OrderPreview[]> {
  const response = await fetch(buildApiUrl("/pedidos"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao carregar os pedidos."));
  }

  return (await response.json()) as OrderPreview[];
}

export async function finalizarPedido(payload: OrderPayload, accessToken: string): Promise<OrderPreview> {
  const response = await fetch(buildApiUrl("/pedidos"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao finalizar o pedido."));
  }

  return (await response.json()) as OrderPreview;
}
