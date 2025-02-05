import { NextResponse } from "next/server";
import { getDashboardData } from "@/services/dashboardService";

export async function GET() {
    try {
        const data = await getDashboardData();
        return NextResponse.json({ dashboard: data }, { status: 200 });
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
