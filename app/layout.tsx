import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./prototype.css";

export const metadata: Metadata = {
  title: "GentleSight",
  description: "Interactive home energy routine monitoring demo"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <a className="skipLink" href="#main-content">
          본문으로 건너뛰기
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
