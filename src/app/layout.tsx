import type { Metadata } from "next";
import ClientProvider from "./ClientProvider";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Video Call App",
  description: "Online video meetings for Everyone || created by Rahimjon.A.R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ClientProvider>
            <Navbar />
            <main className="mx-auto max-w-5xl px-3 py-6">{children}</main>
          </ClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
