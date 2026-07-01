// Necessidades de beleza oferecidas no quiz.
// O `id` de cada necessidade é o mesmo valor usado na coluna "necessidades" da
// Google Sheet do catálogo (lista separada por vírgula), para casar produtos.
import type { Necessidade } from "@/types";

export const NECESSIDADES: Necessidade[] = [
  { id: "hidratacao", label: "Hidratação", categoria: "Skincare", emoji: "💧" },
  { id: "oleosidade", label: "Controle de oleosidade", categoria: "Skincare", emoji: "✨" },
  { id: "acne", label: "Cuidado com acne", categoria: "Skincare", emoji: "🌿" },
  { id: "antiidade", label: "Anti-idade", categoria: "Skincare", emoji: "⏳" },
  { id: "protecao-solar", label: "Proteção solar", categoria: "Skincare", emoji: "☀️" },
  { id: "maquiagem", label: "Maquiagem", categoria: "Makeup", emoji: "💄" },
  { id: "cabelos", label: "Cuidado com os cabelos", categoria: "Cabelo", emoji: "💇‍♀️" },
  { id: "perfumaria", label: "Perfumaria", categoria: "Perfumaria", emoji: "🌸" },
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
