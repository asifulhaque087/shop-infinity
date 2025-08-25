import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/shared/widgets";

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});
export const metadata: Metadata = {
  title: "Shop Infinity",
  description: "Shop Infinity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
