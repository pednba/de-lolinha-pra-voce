// Registro anônimo dos passos do funil (ver supabase/migrations/0002_eventos.sql).
//
// Não há identificação pessoal: o `sessao_id` é um UUID aleatório guardado no
// navegador, que serve só para costurar os passos de uma mesma visita e medir
// abandono. Nome da cliente e qualquer outro dado pessoal ficam de fora.
"use client";

export type EventoTipo =
  | "home_vista"
  | "quiz_iniciado"
  | "necessidade_escolhida"
  | "kits_vistos"
  | "whatsapp_aberto";

interface EventoDados {
  necessidades?: string[];
  kitId?: string;
  valorTotal?: number;
}

const CHAVE_SESSAO = "lolinha_sessao";

/** Fallback quando o navegador bloqueia storage: some no reload, mas mantém o funil da visita. */
let sessaoEfemera: string | null = null;

function novoId(): string {
  // `randomUUID` exige contexto seguro; em http local cai no fallback.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sessaoId(): string {
  try {
    const existente = localStorage.getItem(CHAVE_SESSAO);
    if (existente) return existente;
    const novo = novoId();
    localStorage.setItem(CHAVE_SESSAO, novo);
    return novo;
  } catch {
    if (!sessaoEfemera) sessaoEfemera = novoId();
    return sessaoEfemera;
  }
}

/**
 * Dispara um evento do funil. Nunca lança e nunca bloqueia a navegação:
 * medir o comportamento não pode, em hipótese alguma, atrapalhar a venda.
 */
export function track(tipo: EventoTipo, dados: EventoDados = {}): void {
  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Garante o envio mesmo quando a página está saindo (ida pro WhatsApp).
      keepalive: true,
      body: JSON.stringify({ sessaoId: sessaoId(), tipo, ...dados }),
    }).catch(() => {});
  } catch {
    // Silencioso por definição.
  }
}
