// GET /api/catalog — retorna os produtos do catálogo (Google Sheet da Lolinha).
import { NextResponse } from "next/server";
import { fetchProducts } from "@/lib/google-sheets";

export async function GET() {
  // TODO: cache/revalidate e tratamento de erro.
  const products = await fetchProducts();
  return NextResponse.json({ products });
}
