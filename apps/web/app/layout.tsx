import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolerp.local"),
  title: {
    default: "School ERP Management System",
    template: "%s | School ERP"
  },
  description: "Production-ready school ERP platform for academics, admissions, finance, HR, communication, security, and reporting.",
  applicationName: "School ERP",
  authors: [{ name: "School ERP" }],
  creator: "School ERP",
  publisher: "School ERP",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    title: "School ERP Management System",
    description: "Secure multi-tenant school management platform for complete institutional operations.",
    siteName: "School ERP"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
