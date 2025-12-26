import type { Metadata } from "next";
import { Lato, Inter } from "next/font/google";
import "./globals.css";
import CustomLayout from "./components/CustomLayout";

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
  weight: "100",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Healthcare Solutions Ltd | Bills by Pranoy",
  description: "Healthcare Solutions Ltd Company Bills by Pranoy Biswas Bappa",
  keywords: ["Bills", "Next.js", "Healthcare", "Solutions"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${inter.variable} antialiased bg-[#152111]`}>
        <CustomLayout>{children}</CustomLayout>
      </body>
    </html>
  );
}
