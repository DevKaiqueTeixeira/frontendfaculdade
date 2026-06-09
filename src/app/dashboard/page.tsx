"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Coffee, LogOut, ShoppingBag, UserRound } from "lucide-react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import logo4irmao from "@/assets/logo4imao.png";
import AddressModal from "@/components/dashboard/AddressModal";
import ProfileModal from "@/components/dashboard/ProfileModal";
import { isAdminEmail } from "@/lib/admin";
import { notify } from "@/services/notify";
import { buildProductImageUrl, buscarProdutos } from "@/services/product.service";
import { buscarPerfil, criarPerfilDaSessao } from "@/services/profile.service";
import { useAddressStore } from "@/stores/useAddressStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { getSupabaseClient } from "@/services/supabase";
import type { ProfileFormData } from "@/types/profile";
import type { ProductPreview } from "@/types/product";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSnapshot, setProfileSnapshot] = useState<ProfileFormData | null>(null);
  const {
    canSubmit,
    formData,
    loadFromProfile,
    loading: profileLoading,
    setField,
    submitProfile,
  } = useProfileStore();
  const {
    addresses,
    canAddMore,
    canSubmit: canSubmitAddress,
    deletingAddressId,
    deleteAddress,
    formData: addressFormData,
    loading: addressLoading,
    loadAddresses,
    modalOpen: addressModalOpen,
    modalMode: addressModalMode,
    closeModal: closeAddressModal,
    openCreateModal: openCreateAddressModal,
    openEditModal: openEditAddressModal,
    setField: setAddressField,
    submitAddress,
    submitting: addressSubmitting,
  } = useAddressStore();

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

  const profile = useMemo(() => {
    return profileSnapshot ?? criarPerfilDaSessao(user);
  }, [profileSnapshot, user]);

  const carregarPerfilPersistido = useCallback(async (accessToken?: string, silent = false): Promise<ProfileFormData | null> => {
    if (!supabase) {
      return null;
    }

    let token = accessToken;

    if (!token) {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    }

    if (!token) {
      return null;
    }

    try {
      const nextProfile = await buscarPerfil(token);
      setProfileSnapshot(nextProfile);
      return nextProfile;
    } catch (error) {
      if (!silent) {
        notify.error(error instanceof Error ? error.message : "Nao foi possivel carregar o perfil.");
      }

      return null;
    }
  }, [supabase]);

  const carregarProdutos = useCallback(async (accessToken?: string, silent = false): Promise<void> => {
    try {
      setProductsLoading(true);
      const nextProducts = await buscarProdutos(accessToken);
      setProducts(nextProducts);
    } catch (error) {
      setProducts([]);

      if (!silent) {
        notify.error(error instanceof Error ? error.message : "Nao foi possivel carregar os produtos.");
      }
    } finally {
      setProductsLoading(false);
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

      setUser(data.session?.user ?? null);
      setLoading(false);

      if (isAdminEmail(data.session?.user.email)) {
        router.replace("/admin");
        return;
      }

      if (data.session?.access_token) {
        void carregarPerfilPersistido(data.session.access_token, true);
        void carregarProdutos(data.session.access_token, false);
      } else {
        setProfileSnapshot(null);
        setProducts([]);
      }

      if (!data.session) {
        router.replace("/");
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setUser(nextSession?.user ?? null);

      if (isAdminEmail(nextSession?.user.email)) {
        router.replace("/admin");
        return;
      }

      if (!nextSession) {
        setProfileSnapshot(null);
        setProducts([]);
      } else if (nextSession.access_token) {
        void carregarPerfilPersistido(nextSession.access_token, true);
        void carregarProdutos(nextSession.access_token, false);
      }

      if (!nextSession) {
        router.replace("/");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [carregarPerfilPersistido, carregarProdutos, router, supabase]);

  async function handleOpenProfile() {
    const nextProfile = profileSnapshot
      ?? await carregarPerfilPersistido(undefined, false)
      ?? criarPerfilDaSessao(user);

    await loadAddresses(supabase, true);

    if (!nextProfile.authUserId) {
      return;
    }

    loadFromProfile(nextProfile);
    setShowProfileModal(true);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await submitProfile(supabase);

    if (!result || !result.backendUpdated) {
      return;
    }

    if (result.sessionSynced && result.syncedUser) {
      setUser(result.syncedUser);
    }

    const persistedProfile = await carregarPerfilPersistido(undefined, true);
    const nextProfile = persistedProfile ?? result.profile;

    setProfileSnapshot(nextProfile);
    loadFromProfile(nextProfile);
  }

  async function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitAddress(supabase);
  }

  async function handleAddressDelete(id: number) {
    await deleteAddress(supabase, id);
  }

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
            onClick={handleOpenProfile}
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
        <article className="relative min-h-[38rem] overflow-hidden rounded-3xl border border-[#d8b089]/35 shadow-[0_24px_60px_rgba(20,8,3,0.25)]">
          <Image src={logo4irmao} alt="Logo 4 Irmãos" fill className="object-contain object-center p-8 md:p-10" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(32,14,6,0.56),rgba(57,27,15,0.4))]" />
        </article>

        <div className="flex flex-col gap-6">
          <article className="rounded-3xl border border-[#e2c4a5]/45 bg-[#fffaf4] p-6 shadow-[0_14px_36px_rgba(64,34,18,0.12)] md:p-8">
            <p className="text-xs tracking-[0.2em] text-[#a26a45] uppercase">Área do Cliente . Bem-vindo</p>
            <h1 className="font-display mt-2 text-4xl text-[#4b2616] md:text-5xl">{profile.nome || "cliente"}</h1>
            <p className="mt-3 text-[#6d4027]">Escolha um produto cadastrado pela cafeteria para continuar navegando.</p>
          </article>
          <article className="rounded-3xl border border-[#ddb58e]/45 bg-white p-6 shadow-[0_14px_36px_rgba(64,34,18,0.12)] md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#a26a45] uppercase">Cardápio</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#4b2616]">Produtos disponíveis</h2>
              </div>
              <span className="rounded-full bg-[#f7e4d1] px-3 py-1 text-xs font-semibold text-[#8a5332]">
                {products.length} item{products.length === 1 ? "" : "s"}
              </span>
            </div>

            {productsLoading ? (
              <p className="mt-6 text-sm text-[#6d4027]">Carregando produtos...</p>
            ) : products.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-[#ddb58e] bg-[#fffaf4] px-4 py-5 text-sm text-[#6d4027]">
                Nenhum produto cadastrado ainda.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="flex items-center gap-4 rounded-2xl border border-[#ead2b7] bg-[#fffaf4] p-5 text-left shadow-[0_10px_24px_rgba(78,43,23,0.08)] transition hover:-translate-y-0.5 hover:border-[#c78656] hover:shadow-[0_16px_32px_rgba(78,43,23,0.14)]"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e6c7a9] bg-white">
                      {product.imagemUrl ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={buildProductImageUrl(product.imagemUrl) || ""}
                            alt={product.nome}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-semibold uppercase text-[#8a5332]">{product.nome.slice(0, 2)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[#4b2616]">{product.nome}</p>
                      <p className="mt-2 text-sm text-[#8a5332]">R$ {product.preco.toFixed(2).replace(".", ",")}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <ProfileModal
        open={showProfileModal}
        formData={formData}
        addresses={addresses}
        addressLoading={addressLoading}
        canAddMoreAddresses={canAddMore}
        deletingAddressId={deletingAddressId}
        loading={profileLoading}
        canSubmit={canSubmit}
        onClose={() => setShowProfileModal(false)}
        onAddressOpen={openCreateAddressModal}
        onAddressDelete={handleAddressDelete}
        onAddressEdit={openEditAddressModal}
        onChange={setField}
        onSubmit={handleProfileSubmit}
      />

      <AddressModal
        open={addressModalOpen}
        formData={addressFormData}
        mode={addressModalMode}
        submitting={addressSubmitting}
        canSubmit={canSubmitAddress}
        onClose={closeAddressModal}
        onChange={setAddressField}
        onSubmit={handleAddressSubmit}
      />
    </main>
  );
}
