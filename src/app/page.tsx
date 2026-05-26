"use client";

import Image from "next/image";
import { CadastroUsuarioForm } from "@/components/cadastro/CadastroUsuarioForm";
import { useCadastroUsuarioStore } from "@/stores/useCadastroUsuarioStore";
import cafe from "@/assets/cafe.png";
import background from "@/assets/background.png";

export default function Home() {
  const { formData, setField, cadastrarUsuario, loading, canSubmit, statusType, statusMessage } =
    useCadastroUsuarioStore();

  return (
    <main
      className="relative flex h-screen items-center overflow-hidden px-4 py-4"
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(32,16,10,0.74), rgba(66,36,19,0.56)), url(${background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,233,205,0.2),rgba(38,18,10,0.38))]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_auto]">
        <section className="relative hidden h-[74vh] overflow-hidden rounded-[2.4rem] border border-[#f4d6b5]/25 shadow-[0_24px_70px_rgba(10,4,1,0.55)] lg:block">
          <Image src={cafe} alt="Café especial" fill priority className="object-cover object-[center_74%]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(24,10,6,0.2),rgba(24,10,6,0.6))]" />
          <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-[#fdf4ea] xl:p-10">
            <p className="mb-2 text-sm tracking-[0.25em] text-[#f9d9b2]/90">CAFETERIA ARTESANAL</p>
            <h1 className="font-display text-4xl leading-tight xl:text-5xl">Sabores que aquecem o seu dia</h1>
            <p className="mt-4 max-w-md text-base text-[#f8e8d5]/90">
              Descubra grãos selecionados e experiências únicas em cada xícara.
            </p>
          </div>
        </section>

        <div className="flex justify-center lg:justify-end">
        <CadastroUsuarioForm
          formData={formData}
          onFieldChange={setField}
          onSubmit={cadastrarUsuario}
          loading={loading}
          canSubmit={canSubmit}
          statusType={statusType}
          statusMessage={statusMessage}
        />
        </div>
      </div>
    </main>
  );
}
