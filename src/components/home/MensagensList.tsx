import { MessageSquareText } from "lucide-react";
import { Mensagem } from "@/types/mensagem";

type MensagensListProps = {
  mensagens: Mensagem[];
};

export function MensagensList({ mensagens }: MensagensListProps) {
  return (
    <div className="mt-6 rounded-2xl border border-[#f2c391]/25 bg-[#422618] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-[#ffd7ab]">
        <MessageSquareText className="h-4 w-4" />
        Mensagens no Supabase
      </h3>

      {mensagens.length === 0 ? (
        <p className="text-sm text-[#f6d7b4]/70">Clique em &quot;Listar todos&quot; para carregar as mensagens.</p>
      ) : (
        <ul className="space-y-2 text-sm text-[#ffe8cb]">
          {mensagens.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-[#f0bd84]/25 bg-[#5a341f]/55 px-3 py-2"
            >
              {item.mensagem}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
