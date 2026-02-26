import type { Metadata } from "next";
import "./globals.css";
import { GlobalNavbar } from "@/components/global-navbar";

export const metadata: Metadata = {
  title: "Fitly",
  description: "SaaS coaching sport et nutrition"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <GlobalNavbar />
        {children}
      </body>
    </html>
  );
}
