"use client";

import { useRouter } from "next/navigation";
import {ModeToggle} from "@/components/modeToggle";

export function DashboardLinkButton() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/dashboard");
    };

    return (
        <div className="flex w-full">
            <button
                onClick={handleClick}
                className="flex w-3/4 items-center gap-2 p-4"
            >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <span>G</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Gestock</span>
                </div>
            </button>
            <div className="flex w-2/4 items-center justify-center p-4">
                <ModeToggle />
            </div>
        </div>
    );
}
