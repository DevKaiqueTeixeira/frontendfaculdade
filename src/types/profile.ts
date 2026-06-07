export type ProfileFormData = {
  authUserId: string;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
};

export type ProfileUpdatePayload = ProfileFormData;
