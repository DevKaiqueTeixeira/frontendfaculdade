"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, LogOut, Package } from "lucide-react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { getSupabaseClient } from "@/services/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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

      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setLoading(false);

      if (!data.session) {
        router.replace("/");
        return;
      }

      if (!isAdminEmail(sessionUser?.email)) {
        router.replace("/dashboard");
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const sessionUser = nextSession?.user ?? null;
      setUser(sessionUser);

      if (!nextSession) {
        router.replace("/");
        return;
      }

      if (!isAdminEmail(sessionUser?.email)) {
        router.replace("/dashboard");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [router, supabase]);

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
        <p className="text-[#6b3a21]">Carregando área admin...</p>
      </main>
    );
  }

  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white px-4 py-5 md:px-8">
      <nav className="mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center rounded-2xl border border-[#ead2b7] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(78,43,23,0.18)] md:px-6">
        <div className="justify-self-start rounded-xl border border-[#f3d5b5]/45 bg-white p-2 text-[#6a3a21]">
          <Coffee className="h-7 w-7" />
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Meus produtos"
            title="Meus produtos"
            className="inline-flex items-center gap-2 rounded-xl border border-[#f3d5b5]/45 bg-white px-4 py-2 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
          >
            <Package className="h-4 w-4" />
            <span>Meus produtos</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          className="justify-self-end inline-flex items-center gap-1 rounded-xl border border-[#f3d5b5]/45 bg-white px-3 py-2 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </nav>

      <section className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl items-center justify-center">
        <h1 className="text-center text-5xl font-semibold text-[#4b2616]">hello world</h1>
      </section>
    </main>
  );
}
