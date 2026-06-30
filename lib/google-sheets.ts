// Acesso ao catálogo de produtos na Google Sheet gerenciada pela Lolinha.
// TODO: implementar leitura real da planilha via googleapis.
import { google } from "googleapis";
import type { Product } from "@/types";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

/** Lê os produtos do catálogo a partir da Google Sheet. */
export async function fetchProducts(): Promise<Product[]> {
  // TODO: ler linhas da planilha (GOOGLE_SHEET_ID) e mapear para Product[].
  void getAuth;
  return [];
}
