import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Seguidores | Gestión de Mensajes",
  description: "Panel visual para gestionar seguidores de Instagram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
