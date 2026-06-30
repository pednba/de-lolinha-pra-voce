import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "De Lolinha pra Você",
  description:
    "Curadoria de kits de cosméticos da Lolinha: escolha suas necessidades de beleza e receba kits feitos pra você.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
