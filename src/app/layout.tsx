import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KWEBLOG",
  description: "Simple Blog Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
