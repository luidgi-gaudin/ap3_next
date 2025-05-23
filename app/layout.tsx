import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import { Analytics } from "@vercel/analytics/next";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "GESTOCK",
    description: "Gestock est une application de gestion de stock de médicaments en NEXT.JS 15 avec supabase et Prisma ORM",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
            attribute="class"
            disableTransitionOnChange
            defaultTheme="light"
        >
            {children}
            <Analytics/>
            <Toaster/>
        </ThemeProvider>
        </body>
        </html>
    );
}