type CadastroStatusProps = {
  type: "idle" | "success" | "error";
  message: string;
};

export function CadastroStatus({ type, message }: CadastroStatusProps) {
  if (!message) {
    return null;
  }

  const className =
    type === "success"
      ? "border-emerald-400/40 bg-emerald-100 text-emerald-900"
      : type === "error"
        ? "border-rose-400/40 bg-rose-100 text-rose-900"
        : "border-slate-300 bg-slate-100 text-slate-900";

  return <p className={`rounded-xl border px-4 py-3 text-sm ${className}`}>{message}</p>;
}
