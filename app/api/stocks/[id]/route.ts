import { NextRequest, NextResponse } from "next/server";
import { deleteStock, updateStockQuantity } from "@/services/stockService";

interface RouteProps {
    params: Promise<{ id: string }>;
}

export async function DELETE(
    request: NextRequest,
    props: RouteProps
) {
    try {
        const { id } = await props.params;
        const stockId = parseInt(id);
        await deleteStock(stockId);
        return NextResponse.json({ message: "Stock supprimé" }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du stock" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    props: RouteProps
) {
    try {
        const { id } = await props.params;
        const stockId = parseInt(id);
        const data = await request.json();
        const updatedStock = await updateStockQuantity(stockId, data.quantityToAdd);
        return NextResponse.json(updatedStock, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du stock" },
            { status: 500 }
        );
    }
}