import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/app/globals.css";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "ERP-lite operativo para quesería y lácteos."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
