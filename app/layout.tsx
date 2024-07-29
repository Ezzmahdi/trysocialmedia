import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from '@clerk/nextjs'
import { ModalProvider } from "@/components/modal-provider";

import 'devextreme/dist/css/dx.light.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialLead",
  description: "AI SaaS. Manage your social media using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <ClerkProvider>
      <head>
        <link rel="icon" href="/logo.svg" />
        
      </head>
      <html lang="en">
        <body className={inter.className}>
          <ModalProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
