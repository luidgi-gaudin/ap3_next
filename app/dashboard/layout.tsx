import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import React from "react";
import HeaderUser from "@/components/dashboard/header";

export default function LayoutUser({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <HeaderUser />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
