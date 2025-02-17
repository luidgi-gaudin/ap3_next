import { NextResponse } from "next/server";
import {getAllTypeStock} from "@/services/typeStockService";

export async function GET() {
    try {
        const typeStocks = await getAllTypeStock();
        return NextResponse.json({ typeStocks }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération des types de stocks :", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des types de stocks" },
            { status: 500 }
        );
    }
}
