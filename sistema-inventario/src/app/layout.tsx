import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/responsive.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { NavigationProvider } from "@/contexts/navigation-context";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Inventario",
  description: "Sistema completo de gestión de inventario con control de stock y alertas automáticas",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inventario"
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NavigationProvider>
              {children}
              <Toaster richColors position="top-right" />
            </NavigationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
