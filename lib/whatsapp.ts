// Geração do link de fechamento de venda via WhatsApp da Lolinha.
import type { Kit } from "@/types";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

/** Monta a URL wa.me com a mensagem pré-preenchida do kit escolhido. */
export function buildWhatsAppLink(kit: Kit, clienteNome?: string): string {
  const saudacao = clienteNome ? `Oi Lolinha, sou ${clienteNome}! ` : "Oi Lolinha! ";
  const mensagem =
    `${saudacao}Gostei do kit "${kit.nome}" ` +
    `(R$ ${kit.precoTotal.toFixed(2)}). Quero fechar esse pedido. 💄`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}
