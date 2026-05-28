import { ComponentType, FormEvent } from "react";
import Image from "next/image";
import { CalendarDays, Coffee, IdCard, LockKeyhole, Mail, UserRound } from "lucide-react";
import { CadastroStatus } from "@/components/cadastro/CadastroStatus";
import cafeDetalhe from "@/assets/cafe2.png";

type FormData = {
  nome: string;
  cpf: string;
  senha: string;
  email: string;
  dataNascimento: string;
};

type CadastroUsuarioFormProps = {
  formData: FormData;
  onFieldChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
  canSubmit: boolean;
  statusType: "idle" | "success" | "error";
  statusMessage: string;
};

export function CadastroUsuarioForm({
  formData,
  onFieldChange,
  onSubmit,
  loading,
  canSubmit,
  statusType,
  statusMessage,
}: CadastroUsuarioFormProps) {
  return (
    <section className="relative w-full max-w-xl overflow-hidden rounded-4xl border border-[#d8b089]/30 bg-[#fff9f1]/90 shadow-[0_34px_100px_rgba(20,8,2,0.5)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <Image src={cafeDetalhe} alt="Textura de café" className="h-[72%] w-auto opacity-[0.08]" />
      </div>

      <div className="relative z-10 h-40 w-full md:h-44">
        <Image src={cafeDetalhe} alt="Café especial" fill className="object-cover object-[center_30%]" priority />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(60,28,14,0.2),rgba(60,28,14,0.7))]" />
        <div className="absolute bottom-5 left-6 right-6">
          <p className="inline-flex items-center gap-1.5 text-xs tracking-[0.16em] text-[#f7dbc1] uppercase">
            <Coffee className="h-3.5 w-3.5" />
            Café 4 Irmãos
          </p>
          <h1 className="font-display mt-1 text-3xl text-[#fff4e6]">Cadastro de cliente</h1>
        </div>
      </div>

      <div className="relative z-10 p-5 md:p-6">
        <p className="text-sm text-[#6c3d22] md:text-base">Experiência premium: preencha seus dados para liberar seu atendimento.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <Input label="Nome" icon={UserRound} value={formData.nome} onChange={(v) => onFieldChange("nome", v)} required />
          <Input label="CPF" icon={IdCard} value={formData.cpf} onChange={(v) => onFieldChange("cpf", v)} required />
          <Input label="Email" icon={Mail} value={formData.email} onChange={(v) => onFieldChange("email", v)} type="email" required />
          <Input label="Senha" icon={LockKeyhole} value={formData.senha} onChange={(v) => onFieldChange("senha", v)} type="password" required />
          <Input
            label="Data de nascimento"
            icon={CalendarDays}
            value={formData.dataNascimento}
            onChange={(v) => onFieldChange("dataNascimento", v)}
            type="date"
            required
          />

          <CadastroStatus type={statusType} message={statusMessage} />

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-[linear-gradient(120deg,#7a3f22,#4f2814)] px-4 py-2.5 font-semibold text-[#fff7ed] shadow-[0_10px_24px_rgba(66,32,16,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "Cadastrar usuário"}
          </button>
        </form>
      </div>
    </section>
  );
}

type InputProps = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

function Input({ label, icon: Icon, value, onChange, type = "text", required = false }: InputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[#5b2f19]">
      <span className="font-medium">{label}</span>
      <div className="group flex items-center gap-2 rounded-xl border border-[#985b39]/25 bg-[#fffefc]/90 px-3 py-2 transition focus-within:border-[#7a3f22] focus-within:ring-4 focus-within:ring-[#d0a489]/35">
        <Icon className="h-4 w-4 text-[#7a3f22]" />
        <input
          type={type}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-[#3f1f11] outline-none"
        />
      </div>
    </label>
  );
}
