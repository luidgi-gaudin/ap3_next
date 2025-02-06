import { NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, modifyOrder } from "@/services/ordersService";

const replacer = (_key: string, value: unknown): unknown =>
    typeof value === "bigint" ? value.toString() : value;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const awaitedParams = await params;
        const orderIdNum = parseInt(awaitedParams.orderId, 10);
        if (isNaN(orderIdNum))
            return NextResponse.json({ error: "Identifiant de commande invalide" }, { status: 400 });
        const order = await getOrderById(orderIdNum);
        const serializedOrder = JSON.parse(JSON.stringify(order, replacer));
        return NextResponse.json({ order: serializedOrder }, { status: 200 });
    } catch (error: unknown) {
        console.error("Erreur dans GET /api/orders/[orderId]:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const awaitedParams = await params;
        const orderIdNum = parseInt(awaitedParams.orderId, 10);
        if (isNaN(orderIdNum))
            return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
        const { newStatus } = await request.json();
        if (![2, 3, 4, 5].includes(newStatus))
            return NextResponse.json({ error: "Nouveau statut invalide" }, { status: 400 });
        const updatedOrder = await updateOrderStatus(orderIdNum, newStatus);
        const serializedOrder = JSON.parse(JSON.stringify(updatedOrder, replacer));
        return NextResponse.json({ order: serializedOrder }, { status: 200 });
    } catch (error: unknown) {
        console.error("Erreur dans PUT /api/orders/[orderId]:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const awaitedParams = await params;
        const orderIdNum = parseInt(awaitedParams.orderId, 10);
        if (isNaN(orderIdNum))
            return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
        const { items } = await request.json();
        if (!items || !Array.isArray(items))
            return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
        const updatedOrder = await modifyOrder(orderIdNum, items);
        const serializedOrder = JSON.parse(JSON.stringify(updatedOrder, replacer));
        return NextResponse.json({ order: serializedOrder }, { status: 200 });
    } catch (error: unknown) {
        console.error("Erreur dans PATCH /api/orders/[orderId]:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
