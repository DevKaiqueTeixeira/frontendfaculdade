import { Coffee, MessageSquareText, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="animate-float-card rounded-[2rem] border border-[#8f5734]/20 bg-[#fff8ef]/85 p-6 shadow-[0_24px_80px_rgba(58,27,10,0.2)] backdrop-blur md:p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#7a4424]/20 bg-[#fbe8cf] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#6b3a1e] uppercase">
        <Sparkles className="h-4 w-4" />
        Blend artesanal
      </div>

      <h1 className="font-display mt-6 text-4xl leading-tight text-[#4e2a16] md:text-6xl">
        Cafe 4 Irmaos
      </h1>

      <p className="mt-4 max-w-xl text-[#6b3a1e]/85 md:text-lg">
        Receba mensagens dos clientes e acompanhe tudo com visual de cafeteria premium.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-[#875031]/20 bg-white/70">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1100&q=80"
            alt="Xicara de cafe sobre graos"
            className="h-36 w-full object-cover"
          />
          <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#5f3319]">
            <Coffee className="h-4 w-4" />
            Torras especiais do dia
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-[#875031]/20 bg-white/70">
          <img
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1100&q=80"
            alt="Graos de cafe torrados"
            className="h-36 w-full object-cover"
          />
          <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#5f3319]">
            <MessageSquareText className="h-4 w-4" />
            Mensagens em tempo real
          </div>
        </article>
      </div>
    </section>
  );
}
