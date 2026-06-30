// POST /api/orders — salva um pedido no Supabase antes do fechamento via WhatsApp.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { newId } from "@/lib/utils";

export async function POST(request: Request) {
  // TODO: validar payload e inserir na tabela `pedidos`.
  const body = await request.json().catch(() => ({}));
  void createClient;
  const id = newId();
  return NextResponse.json({ id, ...body, status: "novo" }, { status: 201 });
}
