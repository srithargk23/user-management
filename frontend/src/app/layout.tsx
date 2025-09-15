import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Admin Panel",
  description: "Admin Panel Dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100 text-gray-900">{children}</div>
      </body>
    </html>
  );
}
