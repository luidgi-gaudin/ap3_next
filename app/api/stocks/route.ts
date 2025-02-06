import { NextResponse } from "next/server";
import { getStocksData } from "@/services/stockService";

export async function GET() {
    try {
        const stocks = await getStocksData();
        return NextResponse.json({ stocks }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération des stocks :", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des stocks" },
            { status: 500 }
        );
    }
}
