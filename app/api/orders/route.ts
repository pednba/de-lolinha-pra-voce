// POST /api/orders — salva um pedido no Supabase antes do fechamento via WhatsApp.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { newId } from "@/lib/utils";

interface OrderPayload {
  clienteNome?: string;
  necessidades?: string[];
  kitId?: string;
  produtoIds?: string[];
  valorTotal?: number;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as OrderPayload | null;

  if (!body?.kitId) {
    return NextResponse.json(
      { error: "kitId é obrigatório" },
      { status: 400 },
    );
  }

  const pedido = {
    id: newId(),
    cliente_nome: body.clienteNome ?? null,
    necessidades: body.necessidades ?? [],
    kit_id: body.kitId,
    produto_ids: body.produtoIds ?? [],
    valor_total: body.valorTotal ?? 0,
    status: "novo" as const,
  };

  // Supabase ainda não configurado (ex.: teste com catálogo de exemplo):
  // não persiste, mas não quebra o fluxo de fechamento.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ pedido, persisted: false }, { status: 200 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .insert(pedido)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pedido: data }, { status: 201 });
}
