// Botão de fechamento: registra o pedido no Supabase e leva ao WhatsApp da Lolinha.
"use client";

import { useState } from "react";
import type { Kit } from "@/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({
  kit,
  clienteNome,
}: {
  kit: Kit;
  clienteNome?: string;
}) {
  const [enviando, setEnviando] = useState(false);

  async function fechar() {
    setEnviando(true);
    const link = buildWhatsAppLink(kit, clienteNome);

    try {
      // `keepalive` garante que a gravação conclua mesmo com a navegação a seguir.
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          clienteNome,
          necessidades: kit.necessidades,
          kitId: kit.id,
          produtoIds: kit.produtos.map((p) => p.id),
          valorTotal: kit.precoTotal,
        }),
      });
    } catch {
      // Não bloqueia a venda se a gravação do pedido falhar.
    } finally {
      window.location.href = link;
    }
  }

  return (
    <button
      type="button"
      onClick={fechar}
      disabled={enviando}
      className="inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {enviando ? "Abrindo WhatsApp…" : "Fechar no WhatsApp"}
    </button>
  );
}
