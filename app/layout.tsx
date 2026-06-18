import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support Reply Generator",
  description: "Internal support case tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
