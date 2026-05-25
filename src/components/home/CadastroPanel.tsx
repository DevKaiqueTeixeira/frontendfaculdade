import { FormEvent } from "react";
import { Coffee, List, SendHorizontal } from "lucide-react";
import { Mensagem } from "@/types/mensagem";
import { MensagensList } from "@/components/home/MensagensList";

type CadastroPanelProps = {
  mensagem: string;
  setMensagem: (value: string) => void;
  resposta: string;
  carregando: boolean;
  mensagens: Mensagem[];
  onEnviarMensagem: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onListarTodos: () => Promise<void>;
};

export function CadastroPanel({
  mensagem,
  setMensagem,
  resposta,
  carregando,
  mensagens,
  onEnviarMensagem,
  onListarTodos,
}: CadastroPanelProps) {
  return (
    <section className="rounded-[2rem] border border-[#7d4a2d]/20 bg-[#2e1a12]/90 p-6 text-[#fff6ed] shadow-[0_26px_90px_rgba(26,12,8,0.45)] md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-[#f4c386] p-2 text-[#522e1a]">
          <Coffee className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-[#f6c98f] uppercase">Painel</p>
          <h2 className="font-display text-2xl text-[#fff0df]">Cadastro de mensagens</h2>
        </div>
      </div>

      <form onSubmit={onEnviarMensagem} className="space-y-3">
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem"
          className="w-full rounded-2xl border border-[#d9a777]/45 bg-[#fff6eb] px-4 py-3 text-[#3c2012] outline-none transition focus:border-[#f4b671] focus:ring-4 focus:ring-[#e2a062]/25"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={carregando}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f0a95a] px-4 py-3 font-semibold text-[#3f200f] transition hover:bg-[#f5b56c] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <SendHorizontal className="h-4 w-4" />
            {carregando ? "Carregando..." : "Cadastrar"}
          </button>

          <button
            type="button"
            onClick={onListarTodos}
            disabled={carregando}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f7c58f]/60 bg-transparent px-4 py-3 font-semibold text-[#ffe4c2] transition hover:bg-[#4d2c1a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <List className="h-4 w-4" />
            Listar todos
          </button>
        </div>
      </form>

      {resposta && (
        <p className="mt-4 rounded-xl border border-[#f7c58f]/35 bg-[#4a2c1c] px-4 py-3 text-sm text-[#ffdfb9]">
          {resposta}
        </p>
      )}

      <MensagensList mensagens={mensagens} />
    </section>
  );
}
