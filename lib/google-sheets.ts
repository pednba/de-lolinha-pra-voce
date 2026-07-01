// Acesso ao catálogo de produtos na Google Sheet gerenciada pela Lolinha.
//
// A aba "Produtos" deve ter as colunas (a partir da linha 2):
//   A: id | B: nome | C: descricao | D: categoria | E: preco |
//   F: imagemUrl | G: necessidades (ids separados por vírgula) | H: ativo
import { google } from "googleapis";
import type { Product } from "@/types";
import { SAMPLE_PRODUCTS } from "@/lib/sample-catalog";

const SHEET_RANGE = "Produtos!A2:H";

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

/** Lê os produtos do catálogo a partir da Google Sheet. */
export async function fetchProducts(): Promise<Product[]> {
  // Catálogo de exemplo para testar o fluxo sem a Google Sheet configurada.
  if (process.env.USE_SAMPLE_CATALOG === "true") {
    return SAMPLE_PRODUCTS.filter((p) => p.ativo);
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  // Sem credenciais configuradas: retorna vazio em vez de quebrar (útil em
  // build/preview antes de conectar a planilha).
  if (!spreadsheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    return [];
  }

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: SHEET_RANGE,
  });

  const rows = res.data.values ?? [];
  return rows
    .map(rowToProduct)
    .filter((p): p is Product => p !== null && p.ativo);
}

function rowToProduct(row: string[]): Product | null {
  const [id, nome, descricao, categoria, preco, imagemUrl, necessidades, ativo] =
    row;
  if (!id || !nome) return null;

  return {
    id: String(id).trim(),
    nome: String(nome).trim(),
    descricao: (descricao ?? "").trim(),
    categoria: (categoria ?? "").trim(),
    preco: parsePreco(preco),
    imagemUrl: imagemUrl?.trim() || undefined,
    necessidades: parseList(necessidades),
    ativo: parseAtivo(ativo),
  };
}

/** Converte "R$ 39,90" / "39,90" / "39.90" em número. */
function parsePreco(value?: string): number {
  if (!value) return 0;
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // remove separador de milhar
    .replace(",", ".");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

function parseList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Considera ativo por padrão, exceto valores explicitamente negativos. */
function parseAtivo(value?: string): boolean {
  if (value === undefined) return true;
  const v = value.trim().toLowerCase();
  return !["não", "nao", "false", "0", "n", "inativo"].includes(v);
}
