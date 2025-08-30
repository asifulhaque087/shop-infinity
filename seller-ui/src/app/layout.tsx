import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
// import Header from "@/shared/widgets";
import Providers from "@/app/providers";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});
export const metadata: Metadata = {
  title: "Shop Infinity Seller",
  description: "Shop Infinity Seller",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-slate-900 font-sans antialiased ${poppins.variable}`}
      >
        <Providers>
          {/* <Header /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
