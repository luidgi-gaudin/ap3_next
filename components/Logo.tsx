import * as React from "react";

export default function Logo() {
    return (
        <div className="flex flex-col items-center">
            <div className="relative mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
                <span className="text-xl font-semibold">G</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-wide">Gestock</h1>
        </div>
    );
}