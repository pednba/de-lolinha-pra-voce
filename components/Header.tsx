// Cabeçalho do hotsite.
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-pink-100/80 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">💄</span>
          <span className="text-lg font-semibold tracking-tight">
            De Lolinha <span className="text-pink-600">pra Você</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
