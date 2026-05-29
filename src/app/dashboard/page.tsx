"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Coffee, LogOut, ShoppingBag, UserRound } from "lucide-react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import logo4irmao from "@/assets/logo4imao.png";
import { getSupabaseClient } from "@/services/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  const [loading, setLoading] = useState(() => Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setUser(data.session?.user ?? null);
      setLoading(false);

      if (!data.session) {
        router.replace("/");
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setUser(nextSession?.user ?? null);

      if (!nextSession) {
        router.replace("/");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [router, supabase]);

  const profile = useMemo(() => {
    const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;

    return {
      nome: typeof metadata.nome === "string" ? metadata.nome : "",
      email: user?.email ?? "",
      dataNascimento: typeof metadata.dataNascimento === "string" ? metadata.dataNascimento : "",
      cpf: typeof metadata.cpf === "string" ? metadata.cpf : "",
    };
  }, [user]);

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.replace("/");
  }

  if (supabaseInitError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <p className="max-w-md rounded-2xl border border-rose-300 bg-rose-100 px-5 py-4 text-rose-900">{supabaseInitError}</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <p className="text-[#6b3a21]">Carregando dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-5 md:px-8">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-[#ead2b7] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(78,43,23,0.18)] md:px-6">
        <div className="rounded-xl border border-[#f3d5b5]/45 bg-white p-2 text-[#6a3a21]">
          <Coffee className="h-7 w-7" />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            aria-label="Meu perfil"
            title="Meu perfil"
            className="rounded-xl border border-[#f3d5b5]/45 bg-white px-3 py-2 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
          >
            <UserRound className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Meus pedidos"
            title="Meus pedidos"
            className="rounded-xl border border-[#f3d5b5]/45 bg-white px-3 py-2 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            className="inline-flex items-center gap-1 rounded-xl border border-[#f3d5b5]/45 bg-white px-3 py-2 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <section className="mx-auto mt-6 grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_1fr]">
        <article className="relative min-h-[32rem] overflow-hidden rounded-3xl border border-[#d8b089]/35 shadow-[0_24px_60px_rgba(20,8,3,0.25)]">
          <Image src={logo4irmao} alt="Logo 4 Irmãos" fill className="object-contain object-center p-8 md:p-10" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(32,14,6,0.56),rgba(57,27,15,0.4))]" />
        </article>

        <div className="flex flex-col gap-4">
          <article className="rounded-3xl border border-[#e2c4a5]/45 bg-[#fffaf4] p-6 shadow-[0_14px_36px_rgba(64,34,18,0.12)] md:p-8">
            <p className="text-xs tracking-[0.2em] text-[#a26a45] uppercase">Área do Cliente</p>
            <h1 className="font-display mt-2 text-4xl text-[#4b2616] md:text-5xl">Bem-vindo, {profile.nome || "cliente"}</h1>
            <p className="mt-3 text-[#6d4027]">Seu acesso está ativo. Use o menu acima para abrir seu perfil ou sair da sessão.</p>
          </article>

          <article className="rounded-3xl border border-[#ddb58e]/45 bg-white p-6 shadow-[0_14px_36px_rgba(64,34,18,0.12)] md:p-8">
            <p className="text-xs text-[#9b6644]">Usuário autenticado</p>
            <p className="mt-1 text-sm font-semibold text-[#4b2616]">{profile.email || "Sem email na sessão"}</p>
          </article>
        </div>
      </section>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(33,14,6,0.55)] p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#d8b089]/55 bg-[#fffaf4] p-6 shadow-[0_25px_60px_rgba(23,10,4,0.4)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-3xl text-[#5c301b]">Meu Perfil</h2>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="rounded-lg border border-[#d4aa84]/55 bg-white px-3 py-1.5 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Nome" value={profile.nome} icon={<UserRound className="h-4 w-4" />} />
              <Field label="Email" value={profile.email} />
              <Field label="Data de nascimento" value={profile.dataNascimento} />
              <Field label="CPF" value={profile.cpf} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

type FieldProps = {
  label: string;
  value: string;
  icon?: ReactNode;
};

function Field({ label, value, icon }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[#5f311d]">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-[#9a6545]/30 bg-[#fffefc] px-3 py-2.5">
        {icon}
        <input
          value={value}
          readOnly
          className="w-full bg-transparent text-[#3f1f11] outline-none"
        />
      </div>
    </label>
  );
}
