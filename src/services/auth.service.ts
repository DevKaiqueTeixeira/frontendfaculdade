import { buildApiUrl, parseApiError } from "@/services/api";
import { AuthCadastroPayload, CadastroResponse } from "@/types/cadastro";

export async function cadastrarAuthCliente(payload: AuthCadastroPayload): Promise<CadastroResponse> {
  const response = await fetch(buildApiUrl("/auth/cadastro"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Erro ao cadastrar usuário."));
  }

  return (await response.json()) as CadastroResponse;
}
