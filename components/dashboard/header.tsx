'use client'
import React from "react";
import { usePathname } from "next/navigation"; // Pour obtenir le chemin actuel
import {
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function HeaderUser() {
    const pathname = usePathname(); // Obtenir le chemin actuel
    const segments = pathname.split("/").filter((segment) => segment); // Diviser le chemin en segments

    return (
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {segments.map((segment, index) => {
                                    // Générer l'URL du segment
                                    const href = `/${segments.slice(0, index + 1).join("/")}`;
                                    const isLast = index === segments.length - 1;

                                    return (
                                        <React.Fragment key={href}>
                                            <BreadcrumbItem>
                                                {isLast ? (
                                                    <span>{decodeURIComponent(segment)}</span> // Pas de lien pour le dernier élément
                                                ) : (
                                                    <BreadcrumbLink href={href}>
                                                        {decodeURIComponent(segment)}
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                            {!isLast && <BreadcrumbSeparator />}
                                        </React.Fragment>
                                    );
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
    );
}
