"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface NavigationButtonProps {
    path: string;
    label: string;
    icon?: React.ReactNode;
}

export function NavigationButton({ path, label, icon }: NavigationButtonProps) {
    const router = useRouter();

    const handleNavigation = () => {
        router.push(path);
    };

    return (
        <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleNavigation}
        >
            {icon}
            {label}
        </Button>
    );
}
