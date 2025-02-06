import { NextResponse } from "next/server";
import { getDashboardData } from "@/services/dashboardService";

export async function GET() {
    try {
        const data = await getDashboardData();
        const serializedData = JSON.parse(
            JSON.stringify(data, (_key, value) =>
                typeof value === "bigint" ? value.toString() : value
            )
        );
        return new NextResponse(JSON.stringify({ dashboard: serializedData }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données du dashboard :", error);
        return NextResponse.json(
            {
                error: `Failed to fetch dashboard data: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            },
            { status: 500 }
        );
    }
}
