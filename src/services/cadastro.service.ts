import { CadastroMensagemPayload, Mensagem } from "@/types/mensagem";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ?? (process.env.NODE_ENV === "production"
    ? "https://backendfaculdade.onrender.com"
    : "http://localhost:8080");
const CADASTRO_ENDPOINT = `${API_BASE_URL}/cadastro`;

export async function cadastrarMensagem(payload: CadastroMensagemPayload): Promise<string> {
  const response = await fetch(CADASTRO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const texto = await response.text();

  if (!response.ok) {
    throw new Error("Erro ao cadastrar mensagem.");
  }

  return texto;
}

export async function listarMensagens(): Promise<Mensagem[]> {
  const response = await fetch(CADASTRO_ENDPOINT, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Erro ao listar mensagens.");
  }

  return (await response.json()) as Mensagem[];
}
