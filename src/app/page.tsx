"use client";

import { ComponentType, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, Coffee, IdCard, LockKeyhole, LogIn, LogOut, Mail, UserPlus, UserRound } from "lucide-react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import cafe from "@/assets/cafe.png";
import background from "@/assets/background.png";
import { cadastrarAuthCliente } from "@/services/auth.service";
import { getSupabaseClient } from "@/services/supabase";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"cadastro" | "login">("login");
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cadastroForm, setCadastroForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    dataNascimento: "",
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    senha: "",
  });

  const { supabase, supabaseInitError } = useMemo<{ supabase: SupabaseClient | null; supabaseInitError: string }>(() => {
    try {
      return { supabase: getSupabaseClient(), supabaseInitError: "" };
    } catch (error) {
      return {
        supabase: null,
        supabaseInitError: error instanceof Error ? error.message : "Erro ao inicializar Supabase.",
      };
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const sessionJson = useMemo(
    () => JSON.stringify({ session, user }, null, 2),
    [session, user],
  );

  function setCadastroField(field: keyof typeof cadastroForm, value: string) {
    setCadastroForm((prev) => ({ ...prev, [field]: value }));
  }

  function setLoginField(field: keyof typeof loginForm, value: string) {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setStatusType("idle");

    try {
      setCadastroLoading(true);

      const cliente = await cadastrarAuthCliente({
        nome: cadastroForm.nome,
        cpf: cadastroForm.cpf,
        email: cadastroForm.email,
        senha: cadastroForm.senha,
        dataNascimento: cadastroForm.dataNascimento,
      });

      setStatusType("success");
      setStatusMessage(
        `Usuário criado no Auth e cliente #${cliente.id} cadastrado com sucesso.`,
      );
      setCadastroForm({
        nome: "",
        cpf: "",
        email: "",
        senha: "",
        dataNascimento: "",
      });
      setActiveTab("login");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error instanceof Error ? error.message : "Erro ao cadastrar usuário.");
    } finally {
      setCadastroLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setStatusType("idle");

    try {
      if (!supabase) {
        throw new Error(supabaseInitError || "Erro ao inicializar Supabase.");
      }

      setLoginLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.senha,
      });

      if (error) {
        throw new Error(error.message);
      }

      setStatusType("success");
      setStatusMessage("Login realizado. Sessão ativa carregada abaixo para teste.");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error instanceof Error ? error.message : "Erro ao realizar login.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    setStatusMessage("");
    setStatusType("idle");

    if (!supabase) {
      setStatusType("error");
      setStatusMessage(supabaseInitError || "Erro ao inicializar Supabase.");
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatusType("error");
      setStatusMessage(error.message);
      return;
    }

    setStatusType("success");
    setStatusMessage("Sessão encerrada com sucesso.");
  }

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

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_minmax(440px,520px)]">
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
          <section className="relative w-full overflow-hidden rounded-4xl border border-[#d8b089]/30 bg-[#fff9f1]/90 shadow-[0_34px_100px_rgba(20,8,2,0.5)] backdrop-blur-md">
            <div className="relative z-10 h-40 w-full md:h-44">
              <Image src={cafe} alt="Café especial" fill className="object-cover object-[center_30%]" priority />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(60,28,14,0.2),rgba(60,28,14,0.7))]" />
              <div className="absolute bottom-5 left-6 right-6">
                <p className="inline-flex items-center gap-1.5 text-xs tracking-[0.16em] text-[#f7dbc1] uppercase">
                  <Coffee className="h-3.5 w-3.5" />
                  Café 4 Irmãos
                </p>
              </div>
            </div>

            <div className="relative z-10 p-5 md:p-6">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#ecd9c2] p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === "login" ? "bg-[#6a3a21] text-[#fff7ed]" : "text-[#6a3a21]"
                    }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("cadastro")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === "cadastro" ? "bg-[#6a3a21] text-[#fff7ed]" : "text-[#6a3a21]"
                    }`}
                >
                  Cadastro
                </button>
              </div>

              {activeTab === "login" ? (
                <form onSubmit={handleLogin} className="mt-5 space-y-3">
                  <Input label="Email" icon={Mail} value={loginForm.email} onChange={(v) => setLoginField("email", v)} type="email" required />
                  <Input
                    label="Senha"
                    icon={LockKeyhole}
                    value={loginForm.senha}
                    onChange={(v) => setLoginField("senha", v)}
                    type="password"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(120deg,#7a3f22,#4f2814)] px-4 py-2.5 font-semibold text-[#fff7ed] shadow-[0_10px_24px_rgba(66,32,16,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogIn className="h-4 w-4" />
                    {loginLoading ? "Entrando..." : "Entrar"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCadastro} className="mt-5 space-y-3">
                  <Input label="Nome" icon={UserRound} value={cadastroForm.nome} onChange={(v) => setCadastroField("nome", v)} required />
                  <Input label="CPF" icon={IdCard} value={cadastroForm.cpf} onChange={(v) => setCadastroField("cpf", v)} required />
                  <Input label="Email" icon={Mail} value={cadastroForm.email} onChange={(v) => setCadastroField("email", v)} type="email" required />
                  <Input
                    label="Senha"
                    icon={LockKeyhole}
                    value={cadastroForm.senha}
                    onChange={(v) => setCadastroField("senha", v)}
                    type="password"
                    required
                  />
                  <Input
                    label="Data de nascimento"
                    icon={CalendarDays}
                    value={cadastroForm.dataNascimento}
                    onChange={(v) => setCadastroField("dataNascimento", v)}
                    type="date"
                    required
                  />
                  <button
                    type="submit"
                    disabled={cadastroLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(120deg,#7a3f22,#4f2814)] px-4 py-2.5 font-semibold text-[#fff7ed] shadow-[0_10px_24px_rgba(66,32,16,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UserPlus className="h-4 w-4" />
                    {cadastroLoading ? "Cadastrando..." : "Cadastrar"}
                  </button>
                </form>
              )}

              {(statusMessage || supabaseInitError) && (
                <p
                  className={`mt-4 rounded-xl border px-4 py-3 text-sm ${supabaseInitError
                    ? "border-rose-400/40 bg-rose-100 text-rose-900"
                    : statusType === "success"
                      ? "border-emerald-400/40 bg-emerald-100 text-emerald-900"
                      : statusType === "error"
                        ? "border-rose-400/40 bg-rose-100 text-rose-900"
                        : "border-slate-300 bg-slate-100 text-slate-900"
                    }`}
                >
                  {statusMessage || supabaseInitError}
                </p>
              )}

              {activeTab === "login" && (
                <div className="mt-5 rounded-xl border border-[#caa27f]/40 bg-[#fffaf4] p-3 text-xs">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#5f331d]">Sessão atual (teste)</p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={!session}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#7a3f22]/35 px-2 py-1 text-[#7a3f22] disabled:opacity-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sair
                    </button>
                  </div>
                  <pre className="max-h-56 overflow-auto rounded-lg bg-[#2f170d] p-3 text-[11px] text-[#ffe8cc]">{sessionJson}</pre>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
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
