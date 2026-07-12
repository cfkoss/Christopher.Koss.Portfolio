import type { Metadata } from "next";
import { Gloock, Figtree } from "next/font/google";
import "./globals.css";

const gloock = Gloock({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gloock",
});

const figtree = Figtree({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: {
    default: "Foliomarket — Portfolio websites for designers",
    template: "%s · Foliomarket",
  },
  description:
    "Rent a professionally designed portfolio template, add your work, and publish your portfolio on your own domain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${gloock.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
