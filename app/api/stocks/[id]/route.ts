import { NextRequest, NextResponse } from 'next/server';
import { updateStockQuantity } from "@/services/stockService";

export type ParamsType = Promise<{ id: string }>;

export async function PUT(request: NextRequest, { params }: { params: ParamsType }) {
    try {
        const { id } = await params;
        const stockId = parseInt(id, 10);
        const { quantityToAdd } = await request.json();

        if (isNaN(stockId) || typeof quantityToAdd !== "number") {
            return NextResponse.json(
                { error: "ID de stock ou quantité invalide" },
                { status: 400 }
            );
        }

        const updatedStock = await updateStockQuantity(stockId, quantityToAdd);
        return NextResponse.json(updatedStock, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du stock :", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du stock" },
            { status: 500 }
        );
    }
}
