import type { Metadata } from "next";
import { Fraunces, Figtree, Space_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Shopping List",
  description: "Your household's pantry, fridge, and shopping list.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-linen text-charcoal font-body">
        {children}
      </body>
    </html>
  );
}
