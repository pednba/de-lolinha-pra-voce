// Botão que leva ao fechamento da venda via WhatsApp da Lolinha.
import type { Kit } from "@/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({
  kit,
  clienteNome,
}: {
  kit: Kit;
  clienteNome?: string;
}) {
  return (
    <a
      href={buildWhatsAppLink(kit, clienteNome)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-2 font-medium text-white"
    >
      Fechar no WhatsApp
    </a>
  );
}
