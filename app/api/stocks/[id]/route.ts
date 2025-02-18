import { NextResponse } from "next/server";
import { deleteStock, updateStockQuantity } from "@/services/stockService";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const stockId = parseInt(params.id);
        await deleteStock(stockId);
        return NextResponse.json({ message: "Stock supprimé" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la suppression du stock" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const stockId = parseInt(params.id);
        const { quantityToAdd } = await request.json();
        const updatedStock = await updateStockQuantity(stockId, quantityToAdd);
        return NextResponse.json(updatedStock, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du stock" },
            { status: 500 }
        );
    }
}