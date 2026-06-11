"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Coffee, LogOut, ShoppingBag, UserRound } from "lucide-react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import logo4irmao from "@/assets/logo4imao.png";
import AddressModal from "@/components/dashboard/AddressModal";
import OrderModal from "@/components/dashboard/OrderModal";
import ProfileModal from "@/components/dashboard/ProfileModal";
import { isAdminEmail } from "@/lib/admin";
import { notify } from "@/services/notify";
import { buscarAdicionaisPorProduto } from "@/services/additional.service";
import { buscarPedidos, finalizarPedido } from "@/services/order.service";
import { buildProductImageUrl, buscarProdutos } from "@/services/product.service";
import { buscarPerfil, criarPerfilDaSessao } from "@/services/profile.service";
import { getSupabaseClient } from "@/services/supabase";
import { useAddressStore } from "@/stores/useAddressStore";
import { useProfileStore } from "@/stores/useProfileStore";
import type { AdditionalPreview } from "@/types/additional";
import type { OrderPreview } from "@/types/order";
import type { ProfileFormData } from "@/types/profile";
import type { ProductPreview } from "@/types/product";

type DashboardView = "cardapio" | "pedidos";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>("cardapio");
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [orders, setOrders] = useState<OrderPreview[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductPreview | null>(null);
  const [productAdditionals, setProductAdditionals] = useState<AdditionalPreview[]>([]);
  const [additionalsLoading, setAdditionalsLoading] = useState(false);
  const [selectedAdditionalIds, setSelectedAdditionalIds] = useState<number[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
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

    const token = accessToken ?? await obterAccessToken(supabase);

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

  const carregarPedidos = useCallback(async (accessToken?: string, silent = false): Promise<void> => {
    if (!supabase) {
      return;
    }

    const token = accessToken ?? await obterAccessToken(supabase);

    if (!token) {
      return;
    }

    try {
      setOrdersLoading(true);
      const nextOrders = await buscarPedidos(token);
      setOrders(nextOrders);
    } catch (error) {
      setOrders([]);

      if (!silent) {
        notify.error(error instanceof Error ? error.message : "Nao foi possivel carregar os pedidos.");
      }
    } finally {
      setOrdersLoading(false);
    }
  }, [supabase]);

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
        void carregarPedidos(data.session.access_token, true);
      } else {
        setProfileSnapshot(null);
        setProducts([]);
        setOrders([]);
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
        setOrders([]);
      } else if (nextSession.access_token) {
        void carregarPerfilPersistido(nextSession.access_token, true);
        void carregarProdutos(nextSession.access_token, false);
        void carregarPedidos(nextSession.access_token, true);
      }

      if (!nextSession) {
        router.replace("/");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [carregarPedidos, carregarPerfilPersistido, carregarProdutos, router, supabase]);

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

  async function handleOpenOrder(product: ProductPreview) {
    setSelectedProduct(product);
    setSelectedAdditionalIds([]);
    setSelectedAddressId(addresses[0]?.id ?? null);
    setShowOrderModal(true);
    setAdditionalsLoading(true);

    const addressesPromise = loadAddresses(supabase, true);

    try {
      const [nextAdditionals, nextAddresses] = await Promise.all([
        buscarAdicionaisPorProduto(product.id),
        addressesPromise,
      ]);

      setProductAdditionals(nextAdditionals);
      setSelectedAddressId(nextAddresses?.[0]?.id ?? null);
    } catch (error) {
      setProductAdditionals([]);
      notify.error(error instanceof Error ? error.message : "Nao foi possivel carregar os adicionais.");
    } finally {
      setAdditionalsLoading(false);
    }
  }

  function handleCloseOrderModal() {
    setShowOrderModal(false);
    setSelectedProduct(null);
    setProductAdditionals([]);
    setSelectedAdditionalIds([]);
    setSelectedAddressId(null);
    setAdditionalsLoading(false);
    setOrderSubmitting(false);
  }

  async function handleSubmitOrder() {
    if (!supabase || !selectedProduct) {
      return;
    }

    if (selectedAddressId === null) {
      notify.error("Selecione um endereco cadastrado para finalizar o pedido.");
      return;
    }

    try {
      setOrderSubmitting(true);
      const accessToken = await requireAccessToken(supabase);
      const createdOrder = await finalizarPedido({
        produtoId: selectedProduct.id,
        enderecoId: selectedAddressId,
        adicionaisIds: selectedAdditionalIds,
      }, accessToken);

      setOrders((currentOrders) => [createdOrder, ...currentOrders]);
      setActiveView("pedidos");
      notify.success("Pedido finalizado com sucesso.");
      handleCloseOrderModal();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Nao foi possivel finalizar o pedido.");
    } finally {
      setOrderSubmitting(false);
    }
  }

  function handleToggleAdditional(additionalId: number) {
    setSelectedAdditionalIds((currentIds) => currentIds.includes(additionalId)
      ? currentIds.filter((id) => id !== additionalId)
      : [...currentIds, additionalId]);
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
    const nextAddresses = await submitAddress(supabase);

    if (nextAddresses && showOrderModal && selectedAddressId === null) {
      setSelectedAddressId(nextAddresses[0]?.id ?? null);
    }
  }

  async function handleAddressDelete(id: number) {
    await deleteAddress(supabase, id);

    if (selectedAddressId === id) {
      setSelectedAddressId(null);
    }
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
        <button
          type="button"
          onClick={() => setActiveView("cardapio")}
          className="flex items-center gap-3 rounded-xl border border-[#f3d5b5]/45 bg-white px-3 py-2 text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#fff4e8]"
        >
          <Coffee className="h-7 w-7" />
          <span className="hidden text-sm font-semibold md:inline">Cardápio</span>
        </button>
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
            onClick={() => {
              setActiveView("pedidos");
              void carregarPedidos(undefined, false);
            }}
            aria-label="Meus pedidos"
            title="Meus pedidos"
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${activeView === "pedidos" ? "border-[#6a3a21] bg-[#6a3a21] text-white" : "border-[#f3d5b5]/45 bg-white text-[#6a3a21] hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"}`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden md:inline">Meus pedidos</span>
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
            <p className="text-xs tracking-[0.2em] text-[#a26a45] uppercase">Area do Cliente . Bem-vindo</p>
            <h1 className="font-display mt-2 text-4xl text-[#4b2616] md:text-5xl">{profile.nome || "cliente"}</h1>
            <p className="mt-3 text-[#6d4027]">
              {activeView === "pedidos"
                ? "Aqui ficam os pedidos vinculados ao seu usuario autenticado."
                : "Clique em um item do cardapio para abrir o modal, escolher adicionais e finalizar o pedido."}
            </p>
          </article>

          {activeView === "pedidos" ? (
            <article className="rounded-3xl border border-[#ddb58e]/45 bg-white p-6 shadow-[0_14px_36px_rgba(64,34,18,0.12)] md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.2em] text-[#a26a45] uppercase">Historico</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#4b2616]">Meus pedidos</h2>
                </div>
                <span className="rounded-full bg-[#f7e4d1] px-3 py-1 text-xs font-semibold text-[#8a5332]">
                  {orders.length} pedido{orders.length === 1 ? "" : "s"}
                </span>
              </div>

              {ordersLoading ? (
                <p className="mt-6 text-sm text-[#6d4027]">Carregando pedidos...</p>
              ) : orders.length === 0 ? (
                <p className="mt-6 rounded-2xl border border-dashed border-[#ddb58e] bg-[#fffaf4] px-4 py-5 text-sm text-[#6d4027]">
                  Voce ainda nao fez nenhum pedido.
                </p>
              ) : (
                <div className="mt-6 grid gap-4">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-3xl border border-[#ead2b7] bg-[#fffaf4] p-5 shadow-[0_10px_24px_rgba(78,43,23,0.08)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold tracking-[0.18em] text-[#9b6644] uppercase">
                            Pedido #{order.id}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-[#4b2616]">{order.produtoNome}</h3>
                          <p className="mt-1 text-sm text-[#8a5332]">{formatDate(order.criadoEm)}</p>
                        </div>
                        <span className="rounded-full border border-[#d6a680] bg-white px-3 py-1 text-xs font-semibold text-[#8a5332]">
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 rounded-2xl border border-[#e7c8ac] bg-white/80 p-4 text-sm text-[#6d4027]">
                        <div className="flex items-center justify-between gap-4">
                          <span>Produto base</span>
                          <span className="font-semibold text-[#4b2616]">R$ {formatCurrency(order.precoProduto)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#4b2616]">Entrega</p>
                          <p className="mt-1">{order.enderecoResumo || "Retirada no balcao"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-[#4b2616]">Adicionais</p>
                          {order.adicionais.length === 0 ? (
                            <p className="mt-1">Sem adicionais.</p>
                          ) : (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {order.adicionais.map((additional, index) => (
                                <span
                                  key={`${order.id}-${additional.adicionalId ?? index}-${additional.nome}`}
                                  className="rounded-full border border-[#e2c4a5] bg-white px-3 py-1 text-xs font-semibold text-[#8a5332]"
                                >
                                  {additional.nome} . R$ {formatCurrency(additional.preco)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between border-t border-[#edd6c2] pt-3 text-base font-semibold text-[#4b2616]">
                          <span>Total</span>
                          <span>R$ {formatCurrency(order.valorTotal)}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <article className="rounded-3xl border border-[#ddb58e]/45 bg-white p-6 shadow-[0_14px_36px_rgba(64,34,18,0.12)] md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.2em] text-[#a26a45] uppercase">Cardapio</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#4b2616]">Produtos disponiveis</h2>
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
                      onClick={() => void handleOpenOrder(product)}
                      className="flex items-center gap-4 rounded-2xl border border-[#ead2b7] bg-[#fffaf4] p-5 text-left shadow-[0_10px_24px_rgba(78,43,23,0.08)] transition hover:-translate-y-0.5 hover:border-[#c78656] hover:shadow-[0_16px_32px_rgba(78,43,23,0.14)]"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e6c7a9] bg-white">
                        {product.imagemUrl ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={buildProductImageUrl(product.imagemUrl) || ""}
                              alt={product.nome}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-semibold uppercase text-[#8a5332]">{product.nome.slice(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[#4b2616]">{product.nome}</p>
                        <p className="mt-2 text-sm text-[#8a5332]">R$ {formatCurrency(product.preco)}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a26a45]">Clique para montar</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </article>
          )}
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

      <OrderModal
        open={showOrderModal}
        product={selectedProduct}
        additionals={productAdditionals}
        additionalsLoading={additionalsLoading}
        addresses={addresses}
        selectedAdditionalIds={selectedAdditionalIds}
        selectedAddressId={selectedAddressId}
        submitting={orderSubmitting}
        onClose={handleCloseOrderModal}
        onToggleAdditional={handleToggleAdditional}
        onSelectAddress={setSelectedAddressId}
        onSubmit={() => void handleSubmitOrder()}
      />
    </main>
  );
}

async function obterAccessToken(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function requireAccessToken(supabase: SupabaseClient): Promise<string> {
  const accessToken = await obterAccessToken(supabase);

  if (!accessToken) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  return accessToken;
}

function formatCurrency(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
