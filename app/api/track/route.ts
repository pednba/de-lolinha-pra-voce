// POST /api/track — registra um evento anônimo do funil.
//
// Endpoint público: valida tudo que entra e nunca devolve erro para o cliente,
// porque uma falha de medição não pode virar erro visível pra cliente.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNecessidades } from "@/lib/necessidades";

const TIPOS = new Set([
  "home_vista",
  "quiz_iniciado",
  "necessidade_escolhida",
  "kits_vistos",
  "whatsapp_aberto",
]);

interface TrackPayload {
  sessaoId?: string;
  tipo?: string;
  necessidades?: unknown;
  kitId?: string;
  valorTotal?: unknown;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as TrackPayload | null;

  if (!body?.tipo || !TIPOS.has(body.tipo) || !body.sessaoId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Sem service role key não há como gravar: aceita e ignora, sem quebrar nada.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const evento = {
    sessao_id: String(body.sessaoId).slice(0, 64),
    tipo: body.tipo,
    necessidades: Array.isArray(body.necessidades)
      ? sanitizeNecessidades(body.necessidades.map(String))
      : [],
    kit_id: body.kitId ? String(body.kitId).slice(0, 64) : null,
    valor_total: Number.isFinite(Number(body.valorTotal))
      ? Number(body.valorTotal)
      : null,
  };

  const supabase = createClient();
  const { error } = await supabase.from("eventos").insert(evento);

  if (error) {
    // Loga pro servidor e devolve ok: a visitante não tem nada a ver com isso.
    console.error("[track] falha ao gravar evento:", error.message);
    return NextResponse.json({ ok: false, persisted: false });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
