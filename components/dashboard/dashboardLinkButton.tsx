"use client";

import { useRouter } from "next/navigation";

export function DashboardLinkButton() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/dashboard");
    };

    return (
        <button
            onClick={handleClick}
            className="flex w-full items-center gap-2"
        >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span>G</span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Gestock</span>
            </div>
        </button>
    );
}
