export type ProductPayload = {
  nome: string;
  preco: number;
};

export type ProductPreview = ProductPayload & {
  id: number;
};
