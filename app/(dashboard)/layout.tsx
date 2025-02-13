import {AppSidebar} from "@/components/dashboard/layout/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import HeaderUser from "@/components/dashboard/layout/header";
import React from "react";
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <HeaderUser />
                    {children}
                </SidebarInset>
            </SidebarProvider>
    );
}