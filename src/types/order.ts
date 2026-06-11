export type OrderPayload = {
  produtoId: number;
  enderecoId: number | null;
  adicionaisIds: number[];
};

export type OrderAdditionalPreview = {
  adicionalId: number | null;
  nome: string;
  preco: number;
};

export type OrderPreview = {
  id: number;
  clienteId: number;
  produtoId: number;
  produtoNome: string;
  enderecoId: number | null;
  enderecoResumo: string | null;
  precoProduto: number;
  valorTotal: number;
  status: string;
  criadoEm: string;
  adicionais: OrderAdditionalPreview[];
};
