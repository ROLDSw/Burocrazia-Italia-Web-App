import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { PremiumBackground } from "@/components/layout/PremiumBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Burocrazia - SaaS B2B Scadenze",
  description: "Gestione scadenze burocratiche per professionisti e PMI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${inter.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>
          <PremiumBackground />
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
