import { NextResponse } from "next/server";
import { getStatuses } from "@/services/ordersService";

const bigintReplacer = (_key: string, value: unknown): unknown =>
    typeof value === "bigint" ? value.toString() : value;

export async function GET() {
    try {
        const statuses = await getStatuses();
        return new NextResponse(
            JSON.stringify({ statuses}, bigintReplacer),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
