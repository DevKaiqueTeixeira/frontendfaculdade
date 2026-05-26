"use client";

import { FormEvent, useMemo, useState } from "react";
import { cadastrarCliente } from "@/services/cliente.service";

type FormData = {
  nome: string;
  cpf: string;
  authUserId: string;
  email: string;
  dataNascimento: string;
};

type StatusType = "idle" | "success" | "error";

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
  const [statusType, setStatusType] = useState<StatusType>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const canSubmit = useMemo(() => !loading, [loading]);

  function setField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function cadastrarUsuario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setStatusType("idle");
      setStatusMessage("");

      const cliente = await cadastrarCliente({
        nome: formData.nome,
        cpf: formData.cpf,
        authUserId: formData.authUserId,
        email: formData.email,
        dataNascimento: formData.dataNascimento,
      });

      setStatusType("success");
      setStatusMessage(`Cadastro concluído. Cliente #${cliente.id} criado com sucesso.`);
      setFormData(initialForm);
    } catch (error) {
      setStatusType("error");
      if (error instanceof Error && error.message) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Não foi possível concluir o cadastro.");
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
    statusType,
    statusMessage,
  };
}
