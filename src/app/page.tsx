"use client";

import { CadastroPanel } from "@/components/home/CadastroPanel";
import { HeroSection } from "@/components/home/HeroSection";
import { useCadastroStore } from "@/stores/useCadastroStore";

export default function Home() {
  const { mensagem, setMensagem, resposta, carregando, mensagens, enviarMensagem, listarTodos } =
    useCadastroStore();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(140deg,#f9e9d2_0%,#f2d3a5_45%,#b26b3c_100%)] px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#ffe8c6]/55 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#744124]/35 blur-3xl" />

      <main className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <HeroSection />
        <CadastroPanel
          mensagem={mensagem}
          setMensagem={setMensagem}
          resposta={resposta}
          carregando={carregando}
          mensagens={mensagens}
          onEnviarMensagem={enviarMensagem}
          onListarTodos={listarTodos}
        />
      </main>
    </div>
  );
}
