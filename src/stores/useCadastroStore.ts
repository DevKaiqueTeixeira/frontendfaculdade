"use client";

import { FormEvent, useState } from "react";
import { cadastrarMensagem, listarMensagens } from "@/services/cadastro.service";
import { Mensagem } from "@/types/mensagem";

export type UseCadastroStoreReturn = {
  mensagem: string;
  setMensagem: (value: string) => void;
  resposta: string;
  carregando: boolean;
  mensagens: Mensagem[];
  enviarMensagem: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  listarTodos: () => Promise<void>;
};

export function useCadastroStore(): UseCadastroStoreReturn {
  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

  async function enviarMensagem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!mensagem.trim()) {
      setResposta("Digite uma mensagem antes de cadastrar.");
      return;
    }

    try {
      setCarregando(true);
      setResposta("");

      const texto = await cadastrarMensagem({ mensagem });
      setResposta(texto);
      setMensagem("");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setResposta(error.message);
      } else {
        setResposta("Nao foi possivel conectar ao backend.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function listarTodos() {
    try {
      setCarregando(true);
      setResposta("");

      const data = await listarMensagens();
      setMensagens(data);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setResposta(error.message);
      } else {
        setResposta("Nao foi possivel conectar ao backend.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return {
    mensagem,
    setMensagem,
    resposta,
    carregando,
    mensagens,
    enviarMensagem,
    listarTodos,
  };
}
