import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"
import {AppSidebar} from "@/components/dashboard/layout/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import HeaderUser from "@/components/dashboard/layout/header";
import React from "react";


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
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            disableTransitionOnChange
            defaultTheme="light"
        >
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <HeaderUser />
                    {children}
                </SidebarInset>
            </SidebarProvider>
            <Toaster />
        </ThemeProvider>

        </body>
        </html>
    );
}