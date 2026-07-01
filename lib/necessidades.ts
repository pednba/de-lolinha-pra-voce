// Necessidades de beleza oferecidas no quiz.
// O `id` de cada necessidade é o mesmo valor usado na coluna "necessidades" da
// Google Sheet do catálogo (lista separada por vírgula), para casar produtos.
import type { Necessidade } from "@/types";

export const NECESSIDADES: Necessidade[] = [
  { id: "hidratacao", label: "Hidratação", categoria: "Skincare" },
  { id: "oleosidade", label: "Controle de oleosidade", categoria: "Skincare" },
  { id: "acne", label: "Cuidado com acne", categoria: "Skincare" },
  { id: "antiidade", label: "Anti-idade", categoria: "Skincare" },
  { id: "protecao-solar", label: "Proteção solar", categoria: "Skincare" },
  { id: "maquiagem", label: "Maquiagem", categoria: "Makeup" },
  { id: "cabelos", label: "Cuidado com os cabelos", categoria: "Cabelo" },
  { id: "perfumaria", label: "Perfumaria", categoria: "Perfumaria" },
];

const BY_ID = new Map(NECESSIDADES.map((n) => [n.id, n]));

/** Retorna o label amigável de uma necessidade a partir do id. */
export function necessidadeLabel(id: string): string {
  return BY_ID.get(id)?.label ?? id;
}

/** Filtra ids válidos (presentes na lista de necessidades). */
export function sanitizeNecessidades(ids: string[]): string[] {
  return ids.filter((id) => BY_ID.has(id));
}
