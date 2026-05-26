export type ClienteCadastroPayload = {
  nome: string;
  cpf: string;
  authUserId: string;
  email: string;
  dataNascimento: string;
};

export type AuthCadastroPayload = {
  nome: string;
  cpf: string;
  senha: string;
  email: string;
  dataNascimento: string;
};

export type CadastroResponse = {
  id: number;
  mensagem: string;
};
