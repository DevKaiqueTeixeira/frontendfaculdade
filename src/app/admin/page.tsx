"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Coffee, LogOut, Package, Pencil, Trash2 } from "lucide-react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import cafe from "@/assets/cafe2.png";
import AdditionalModal from "@/components/admin/AdditionalModal";
import { isAdminEmail } from "@/lib/admin";
import { removeEmoji } from "@/lib/removeEmoji";
import { buscarAdicionaisPorProduto, cadastrarAdicional, excluirAdicional } from "@/services/additional.service";
import { notify } from "@/services/notify";
import { atualizarProduto, buildProductImageUrl, buscarProdutos, cadastrarProduto, excluirProduto } from "@/services/product.service";
import { getSupabaseClient } from "@/services/supabase";
import type { AdditionalPreview } from "@/types/additional";
import type { ProductPreview } from "@/types/product";

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return brlFormatter.format(Number(digits) / 100);
}

function formatCurrencyValue(value: number) {
  return brlFormatter.format(value);
}

function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return Number.NaN;
  }

  return Number(digits) / 100;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"cadastro" | "produtos">("cadastro");
  const [user, setUser] = useState<User | null>(null);
  const [additionalModalOpen, setAdditionalModalOpen] = useState(false);
  const [additionalLoading, setAdditionalLoading] = useState(false);
  const [deletingAdditionalId, setDeletingAdditionalId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [selectedProductForAdditional, setSelectedProductForAdditional] = useState<ProductPreview | null>(null);
  const [additionalsByProduct, setAdditionalsByProduct] = useState<Record<number, AdditionalPreview[]>>({});
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [additionalForm, setAdditionalForm] = useState({
    nome: "",
    preco: "",
  });
  const [form, setForm] = useState({
    nome: "",
    preco: "",
  });
  const [productImage, setProductImage] = useState<File | null>(null);

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
        setAdditionalsByProduct({});
        setProducts([]);
        router.replace("/");
        return;
      }

      if (!isAdminEmail(sessionUser?.email)) {
        setAdditionalsByProduct({});
        setProducts([]);
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

  function setField(field: keyof typeof form, value: string) {
    const sanitizedValue = removeEmoji(value);

    setForm((prev) => ({
      ...prev,
      [field]: field === "preco" ? formatCurrencyInput(sanitizedValue) : sanitizedValue,
    }));
  }

  function resetForm() {
    setForm({ nome: "", preco: "" });
    setProductImage(null);
    setImageInputKey((prev) => prev + 1);
    setEditingProductId(null);
  }

  function setAdditionalField(field: keyof typeof additionalForm, value: string) {
    const sanitizedValue = removeEmoji(value);

    setAdditionalForm((prev) => ({
      ...prev,
      [field]: field === "preco" ? formatCurrencyInput(sanitizedValue) : sanitizedValue,
    }));
  }

  function resetAdditionalForm() {
    setAdditionalForm({
      nome: "",
      preco: "",
    });
  }

  async function handleOpenProducts() {
    setActiveView("produtos");
    await loadProducts();
  }

  function handleOpenAdditionalModal(product: ProductPreview) {
    setSelectedProductForAdditional(product);
    resetAdditionalForm();
    setAdditionalModalOpen(true);
  }

  function handleCloseAdditionalModal() {
    setAdditionalModalOpen(false);
    setSelectedProductForAdditional(null);
    resetAdditionalForm();
  }

  async function loadAdditionalsForProduct(produtoId: number, accessToken: string) {
    const nextAdditionals = await buscarAdicionaisPorProduto(produtoId, accessToken);
    setAdditionalsByProduct((prev) => ({
      ...prev,
      [produtoId]: nextAdditionals,
    }));
  }

  async function loadProducts() {
    try {
      if (!supabase) {
        throw new Error(supabaseInitError || "Erro ao inicializar Supabase.");
      }

      setProductsLoading(true);

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      const nextProducts = await buscarProdutos(accessToken);
      setProducts(nextProducts);

      if (nextProducts.length === 0) {
        setAdditionalsByProduct({});
        return;
      }

      const additionalEntries = await Promise.all(
        nextProducts.map(async (product) => {
          const additionals = await buscarAdicionaisPorProduto(product.id, accessToken);
          return [product.id, additionals] as const;
        }),
      );

      setAdditionalsByProduct(Object.fromEntries(additionalEntries));
    } catch (error) {
      setAdditionalsByProduct({});
      notify.error(error instanceof Error ? error.message : "Erro ao carregar produtos.");
    } finally {
      setProductsLoading(false);
    }
  }

  function startEdit(product: ProductPreview) {
    setActiveView("cadastro");
    setEditingProductId(product.id);
    setProductImage(null);
    setForm({
      nome: removeEmoji(product.nome),
      preco: formatCurrencyValue(product.preco),
    });
  }

  async function handleDelete(id: number) {
    try {
      if (!supabase) {
        throw new Error(supabaseInitError || "Erro ao inicializar Supabase.");
      }

      setDeletingProductId(id);

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      const response = await excluirProduto(id, accessToken);
      notify.success(response.mensagem || "Produto excluido com sucesso.");
      setProducts((prev) => prev.filter((product) => product.id !== id));
      setAdditionalsByProduct((prev) => {
        const nextState = { ...prev };
        delete nextState[id];
        return nextState;
      });

      if (editingProductId === id) {
        resetForm();
      }

      if (selectedProductForAdditional?.id === id) {
        handleCloseAdditionalModal();
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Erro ao excluir produto.");
    } finally {
      setDeletingProductId(null);
    }
  }

  async function handleAdditionalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (!supabase) {
        throw new Error(supabaseInitError || "Erro ao inicializar Supabase.");
      }

      if (!selectedProductForAdditional) {
        throw new Error("Produto nao selecionado.");
      }

      setAdditionalLoading(true);

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      const precoNormalizado = parseCurrencyInput(additionalForm.preco);

      if (!Number.isFinite(precoNormalizado)) {
        throw new Error("Preco invalido.");
      }

      const response = await cadastrarAdicional(
        {
          nome: removeEmoji(additionalForm.nome),
          preco: precoNormalizado,
          produtoId: selectedProductForAdditional.id,
        },
        accessToken,
      );

      notify.success(response.mensagem || "Adicional cadastrado com sucesso.");
      await loadAdditionalsForProduct(selectedProductForAdditional.id, accessToken);
      handleCloseAdditionalModal();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Erro ao cadastrar adicional.");
    } finally {
      setAdditionalLoading(false);
    }
  }

  async function handleDeleteAdditional(productId: number, additionalId: number) {
    try {
      if (!supabase) {
        throw new Error(supabaseInitError || "Erro ao inicializar Supabase.");
      }

      setDeletingAdditionalId(additionalId);

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      const response = await excluirAdicional(additionalId, accessToken);
      notify.success(response.mensagem || "Adicional excluido com sucesso.");
      setAdditionalsByProduct((prev) => ({
        ...prev,
        [productId]: (prev[productId] ?? []).filter((additional) => additional.id !== additionalId),
      }));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Erro ao excluir adicional.");
    } finally {
      setDeletingAdditionalId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (!supabase) {
        throw new Error(supabaseInitError || "Erro ao inicializar Supabase.");
      }

      setSubmitLoading(true);

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      const precoNormalizado = parseCurrencyInput(form.preco);

      if (!Number.isFinite(precoNormalizado)) {
        throw new Error("Preco invalido.");
      }

      const payload = {
        nome: removeEmoji(form.nome),
        preco: precoNormalizado,
        imagem: productImage,
      };

      if (!editingProductId && !productImage) {
        throw new Error("Imagem do produto e obrigatoria.");
      }

      const response = editingProductId
        ? await atualizarProduto(editingProductId, payload, accessToken)
        : await cadastrarProduto(payload, accessToken);

      notify.success(response.mensagem || (editingProductId ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso."));
      const wasEditing = Boolean(editingProductId);
      resetForm();

      if (wasEditing || activeView === "produtos") {
        setActiveView("produtos");
        await loadProducts();
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Erro ao cadastrar produto.");
    } finally {
      setSubmitLoading(false);
    }
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
        <button
          type="button"
          onClick={() => setActiveView("cadastro")}
          aria-label="Cadastrar produto"
          title="Cadastrar produto"
          className="justify-self-start rounded-xl border border-[#f3d5b5]/45 bg-white p-2 text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
        >
          <Coffee className="h-7 w-7" />
        </button>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void handleOpenProducts()}
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

      <section className={`mx-auto flex w-full max-w-6xl py-4 ${activeView === "produtos" ? "items-start justify-start" : "items-start justify-center"}`}>
        <div className="w-full max-w-6xl">
          {activeView === "cadastro" ? (
            <div className="grid w-full items-stretch gap-6 lg:grid-cols-2">
              <section className="relative hidden min-h-[32rem] overflow-hidden rounded-[2.4rem] border border-[#f4d6b5]/25 shadow-[0_24px_70px_rgba(10,4,1,0.3)] lg:block">
                <Image src={cafe} alt="Café especial" fill priority className="object-cover object-center" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(24,10,6,0.25),rgba(24,10,6,0.62))]" />
                <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-[#fdf4ea] xl:p-10">
                  <p className="mb-2 text-sm tracking-[0.25em] text-[#f9d9b2]/90">ÁREA ADMIN</p>
                  <h1 className="font-display text-4xl leading-tight xl:text-5xl">Gerencie seus produtos com mais agilidade</h1>
                  <p className="mt-4 max-w-md text-base text-[#f8e8d5]/90">
                    Cadastre novos itens do cardápio e mantenha seu catálogo organizado em poucos passos.
                  </p>
                </div>
              </section>

              <article className="flex min-h-[32rem] w-full flex-col justify-center rounded-3xl border border-[#e2c4a5]/45 bg-[#fffaf4] p-6 shadow-[0_14px_36px_rgba(64,34,18,0.12)] md:p-7">
                <div className="mx-auto w-full max-w-md">
                  <p className="text-xs tracking-[0.2em] text-[#a26a45] uppercase">Área Admin</p>
                  <h1 className="mt-2 text-3xl font-semibold text-[#4b2616] md:text-4xl">
                    {editingProductId ? "Editar produto" : "Cadastrar produto"}
                  </h1>
                  <p className="mt-3 text-sm text-[#6d4027]">
                    {editingProductId
                      ? "Atualize os dados do produto selecionado."
                      : "Preencha os dados abaixo para adicionar um novo produto ao catálogo."}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <label className="flex flex-col gap-1 text-sm text-[#5b2f19]">
                      <span className="font-medium">Nome do produto</span>
                      <input
                        type="text"
                        value={form.nome}
                        onChange={(event) => setField("nome", event.target.value)}
                        placeholder="Digite o nome do produto"
                        required
                        className="rounded-xl border border-[#985b39]/25 bg-[#fffefc]/90 px-3 py-2.5 text-sm text-[#3f1f11] outline-none transition focus:border-[#7a3f22] focus:ring-4 focus:ring-[#d0a489]/35"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-[#5b2f19]">
                      <span className="font-medium">Preço</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        value={form.preco}
                        onChange={(event) => setField("preco", event.target.value)}
                        required
                        className="rounded-xl border border-[#985b39]/25 bg-[#fffefc]/90 px-3 py-2.5 text-sm text-[#3f1f11] outline-none transition focus:border-[#7a3f22] focus:ring-4 focus:ring-[#d0a489]/35"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-[#5b2f19]">
                      <span className="font-medium">Imagem do produto</span>
                      <input
                        key={imageInputKey}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        required={!editingProductId}
                        onChange={(event) => setProductImage(event.target.files?.[0] ?? null)}
                        className="rounded-xl border border-[#985b39]/25 bg-[#fffefc]/90 px-3 py-2.5 text-sm text-[#3f1f11] outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-[#6a3a21] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#4f2814] focus:border-[#7a3f22] focus:ring-4 focus:ring-[#d0a489]/35"
                      />
                      <span className="text-xs text-[#8a5332]">
                        {editingProductId ? "Selecione uma nova imagem apenas se quiser substituir a atual." : "Selecione a imagem que sera exibida ao cliente."}
                      </span>
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(120deg,#7a3f22,#4f2814)] px-4 py-2.5 text-sm font-semibold text-[#fff7ed] shadow-[0_10px_24px_rgba(66,32,16,0.35)] transition hover:bg-[linear-gradient(120deg,#8f4b2a,#5f311b)] hover:shadow-[0_14px_28px_rgba(66,32,16,0.42)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Package className="h-4 w-4" />
                        {submitLoading ? (editingProductId ? "Salvando..." : "Cadastrando...") : (editingProductId ? "Salvar alterações" : "Cadastrar produto")}
                      </button>

                      {editingProductId ? (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d8b089]/45 bg-white px-4 py-3 text-sm font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
                        >
                          Cancelar edição
                        </button>
                      ) : null}
                    </div>
                  </form>
                </div>
              </article>
            </div>
          ) : null}

          {activeView === "produtos" ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setActiveView("cadastro")}
                className="inline-flex items-center justify-center rounded-2xl border border-[#d8b089]/45 bg-white px-4 py-3 font-semibold text-[#6a3a21] transition hover:border-[#6a3a21] hover:bg-[#6a3a21] hover:text-white"
              >
                Voltar para cadastro
              </button>

              <article className="rounded-3xl border border-[#ddb58e]/45 bg-white p-6 shadow-[0_14px_36px_rgba(64,34,18,0.12)] md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-[0.2em] text-[#a26a45] uppercase">Produtos</p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#4b2616]">Meus produtos</h2>
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
                  <div className="mt-6 space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-2xl border border-[#ead2b7] bg-[#fffaf4] p-4 shadow-[0_10px_24px_rgba(78,43,23,0.08)]"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e6c7a9] bg-white">
                              {product.imagemUrl ? (
                                <div className="relative h-full w-full">
                                  <Image
                                    src={buildProductImageUrl(product.imagemUrl) || ""}
                                    alt={product.nome}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <span className="text-sm font-semibold uppercase text-[#8a5332]">{product.nome.slice(0, 2)}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-[#4b2616]">{product.nome}</p>
                              <p className="mt-1 text-sm text-[#8a5332]">R$ {product.preco.toFixed(2).replace(".", ",")}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAdditionalModal(product)}
                              className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-700 hover:bg-sky-700 hover:text-white"
                            >
                              Cadastrar adicional
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(product)}
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-700 hover:bg-emerald-700 hover:text-white"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              disabled={deletingProductId === product.id}
                              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-700 hover:bg-rose-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" />
                              {deletingProductId === product.id ? "Excluindo..." : "Excluir"}
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-[#ead2b7] pt-4">
                          <p className="text-xs tracking-[0.18em] text-[#a26a45] uppercase">Adicionais</p>
                          {(additionalsByProduct[product.id] ?? []).length === 0 ? (
                            <p className="mt-3 text-sm text-[#6d4027]">Nenhum adicional vinculado a este produto.</p>
                          ) : (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {(additionalsByProduct[product.id] ?? []).map((additional) => (
                                <div
                                  key={additional.id}
                                  className="flex min-w-[220px] flex-1 items-center justify-between gap-3 rounded-xl border border-[#f0dbc7] bg-white px-3 py-2"
                                >
                                  <div>
                                    <span className="text-sm font-medium text-[#4b2616]">{additional.nome}</span>
                                    <p className="text-sm text-[#8a5332]">R$ {additional.preco.toFixed(2).replace(".", ",")}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteAdditional(product.id, additional.id)}
                                    disabled={deletingAdditionalId === additional.id}
                                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-700 hover:bg-rose-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {deletingAdditionalId === additional.id ? "Excluindo..." : "Excluir"}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>
          ) : null}
        </div>
      </section>

      <AdditionalModal
        open={additionalModalOpen}
        productName={selectedProductForAdditional?.nome || ""}
        formData={additionalForm}
        submitting={additionalLoading}
        onClose={handleCloseAdditionalModal}
        onChange={setAdditionalField}
        onSubmit={handleAdditionalSubmit}
      />
    </main>
  );
}
