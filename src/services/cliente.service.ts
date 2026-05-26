import { buildApiUrl, parseApiError } from "@/services/api";
import { CadastroResponse, ClienteCadastroPayload } from "@/types/cadastro";

export async function cadastrarCliente(payload: ClienteCadastroPayload): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl("/clientes"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao cadastrar cliente."));
  }

  return (await response.json()) as CadastroResponse;
}
