// Utilitários gerais.
import { nanoid } from "nanoid";

/** Formata um valor numérico como moeda brasileira. */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Gera um id curto e único para pedidos. */
export function newId(): string {
  return nanoid(12);
}
