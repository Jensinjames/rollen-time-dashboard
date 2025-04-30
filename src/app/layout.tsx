import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rollen Dashboard",
  description: "Personal productivity and time-tracking dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col md:flex-row">
            <Navigation />
            <main className="flex-1 pb-20 md:ml-64 md:pb-0">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
