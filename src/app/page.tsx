"use client";

import { FormEvent, useState } from "react";

type Mensagem = {
  id: number;
  mensagem: string;
};

export default function Home() {
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

      const response = await fetch("http://localhost:8080/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mensagem }),
      });

      const texto = await response.text();

      if (!response.ok) {
        setResposta("Erro ao cadastrar mensagem.");
        return;
      }

      setResposta(texto);
      setMensagem("");
    } catch {
      setResposta("Nao foi possivel conectar ao backend.");
    } finally {
      setCarregando(false);
    }
  }

  async function listarTodos() {
    try {
      setCarregando(true);
      setResposta("");

      const response = await fetch("http://localhost:8080/cadastro");
      if (!response.ok) {
        setResposta("Erro ao listar mensagens.");
        return;
      }

      const data = (await response.json()) as Mensagem[];
      setMensagens(data);
    } catch {
      setResposta("Nao foi possivel conectar ao backend.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8e8d2_0%,#e7c79f_42%,#b5753f_100%)] px-4 py-12">
      <main className="mx-auto w-full max-w-xl rounded-3xl border border-[#6a3f1f]/20 bg-[#fff7ec]/90 p-8 shadow-[0_24px_60px_rgba(54,28,10,0.25)] backdrop-blur-sm">
        <h1 className="text-center text-4xl font-semibold tracking-wide text-[#4f2d16]">
          Café 4 irmãos
        </h1>

        <p className="mt-2 text-center text-[#6a3f1f]/80">
          Envie uma mensagem para cadastrar no backend.
        </p>

        <form onSubmit={enviarMensagem} className="mt-8 space-y-3">
          <input
            type="text"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite sua mensagem"
            className="w-full rounded-xl border border-[#6a3f1f]/20 bg-white px-4 py-3 text-[#3f2413] outline-none transition focus:border-[#9a5d30] focus:ring-2 focus:ring-[#d59a64]/35"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={carregando}
              className="rounded-xl bg-[#7f4a24] px-4 py-3 font-medium text-[#fff4e8] transition hover:bg-[#6f3f1f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {carregando ? "Carregando..." : "Cadastrar"}
            </button>
            <button
              type="button"
              onClick={listarTodos}
              disabled={carregando}
              className="rounded-xl border border-[#7f4a24] bg-[#f6e6d2] px-4 py-3 font-medium text-[#5b341a] transition hover:bg-[#efd8bd] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Listar todos
            </button>
          </div>
        </form>

        {resposta && (
          <p className="mt-5 rounded-lg bg-[#f1ddc4] px-4 py-3 text-center text-[#5f361c]">
            {resposta}
          </p>
        )}

        {mensagens.length > 0 && (
          <div className="mt-5 rounded-xl border border-[#6a3f1f]/20 bg-white/80 p-4">
            <h2 className="text-sm font-semibold text-[#5f361c]">Mensagens do H2</h2>
            <ul className="mt-2 space-y-1 text-sm text-[#3f2413]/95">
              {mensagens.map((item) => (
                <li key={item.id}>- {item.mensagem}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
