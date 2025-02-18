import { NextResponse } from "next/server";
import {createStock, getStocksData} from "@/services/stockService";

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

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const newStock = await createStock({
            nom: data.nom,
            description: data.description,
            id_type_stock: parseInt(data.id_type_stock),
            quantite_disponible: 0,
        });
        return NextResponse.json({ stock: newStock }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la création du stock" },
            { status: 500 }
        );
    }
}
