// GET /api/catalog — retorna os produtos do catálogo (Google Sheet da Lolinha).
import { NextResponse } from "next/server";
import { fetchProducts } from "@/lib/google-sheets";

// Revalida o catálogo a cada 5 minutos.
export const revalidate = 300;

export async function GET() {
  try {
    const products = await fetchProducts();
    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Falha ao ler o catálogo: ${message}` },
      { status: 502 },
    );
  }
}
