// Lógica de curadoria: a partir das necessidades escolhidas pela cliente,
// monta sugestões de kits com os produtos do catálogo.
// TODO: implementar algoritmo de curadoria.
import type { Kit, Product } from "@/types";

/** Filtra produtos que atendem a pelo menos uma das necessidades informadas. */
export function matchProducts(
  products: Product[],
  necessidades: string[],
): Product[] {
  return products.filter(
    (p) => p.ativo && p.necessidades.some((n) => necessidades.includes(n)),
  );
}

/** Monta kits curados a partir das necessidades da cliente. */
export function buildKits(
  products: Product[],
  necessidades: string[],
): Kit[] {
  void matchProducts(products, necessidades);
  // TODO: agrupar produtos em kits e calcular precoTotal.
  return [];
}
