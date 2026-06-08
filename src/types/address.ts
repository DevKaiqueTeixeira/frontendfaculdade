export type AddressFormData = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  pontoReferencia: string;
  tipoEndereco: string;
};

export type AddressPreview = AddressFormData & {
  id: number;
};

export type AddressPayload = AddressFormData;

export type AddressModalMode = "create" | "edit";
