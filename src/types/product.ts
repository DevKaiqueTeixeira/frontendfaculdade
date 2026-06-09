export type ProductPayload = {
  nome: string;
  preco: number;
  imagem: File | null;
};

export type ProductPreview = {
  id: number;
  nome: string;
  preco: number;
  imagemUrl: string | null;
};
