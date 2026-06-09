"use client";

import { FormEvent, useMemo, useState } from "react";
import { cadastrarCliente } from "@/services/cliente.service";
import { notify } from "@/services/notify";

type FormData = {
  nome: string;
  cpf: string;
  authUserId: string;
  email: string;
  dataNascimento: string;
};

const initialForm: FormData = {
  nome: "",
  cpf: "",
  authUserId: "",
  email: "",
  dataNascimento: "",
};

export function useCadastroUsuarioStore() {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => !loading, [loading]);

  function setField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function cadastrarUsuario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);

      const cliente = await cadastrarCliente({
        nome: formData.nome,
        cpf: formData.cpf,
        authUserId: formData.authUserId,
        email: formData.email,
        dataNascimento: formData.dataNascimento,
      });

      notify.success(`Cadastro concluído. Cliente #${cliente.id} criado com sucesso.`);
      setFormData(initialForm);
    } catch (error) {
      if (error instanceof Error && error.message) {
        notify.error(error.message);
      } else {
        notify.error("Não foi possível concluir o cadastro.");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    formData,
    setField,
    cadastrarUsuario,
    loading,
    canSubmit,
  };
}
