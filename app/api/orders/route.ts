import { NextResponse } from "next/server";
import { createOrder, getOrdersData } from "@/services/ordersService";

const bigintReplacer = (_key: string, value: unknown): unknown =>
    typeof value === "bigint" ? value.toString() : value;

export async function GET() {
    try {
        const data = await getOrdersData();
        return new NextResponse(
            JSON.stringify({ orders: data.orders }, bigintReplacer),
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, supabaseUserId } = body;

        if (!items || !Array.isArray(items)) {
            throw new Error("Le corps de la requête doit contenir un tableau 'items'");
        }
        if (!supabaseUserId) {
            throw new Error("L'identifiant utilisateur est requis");
        }

        const newOrder = await createOrder({ items, supabaseUserId });
        return new NextResponse(
            JSON.stringify({ order: newOrder }, bigintReplacer),
            {
                status: 201,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Erreur lors de la création de la commande :", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}