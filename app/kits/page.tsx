// Página de resultados: exibe os kits curados sugeridos para a cliente.
// TODO: receber necessidades, montar kits e renderizar KitCard + WhatsAppButton.
export default function KitsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Seus kits selecionados</h1>
      <p className="mt-2 text-neutral-600">
        Kits pensados especialmente para as suas necessidades.
      </p>
    </main>
  );
}
