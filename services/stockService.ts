import { prisma } from "@/lib/prisma";

export async function getStocksData() {
    const stocks = await prisma.stock.findMany({
        orderBy: { id_stock: "asc" },
        include: { TypeStock: true },
    });
    return JSON.parse(JSON.stringify(stocks, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value
    ));
}

export async function updateStockQuantity(stockId: number, quantityToAdd: number) {
    try {
        const stock = await prisma.stock.findUnique({
            where: { id_stock: stockId },
        });

        if (!stock) {
            throw new Error("Stock non trouvé");
        }

        const updatedStock = await prisma.stock.update({
            where: { id_stock: stockId },
            data: {
                quantite_disponible: stock.quantite_disponible + quantityToAdd,
            },
            include: { TypeStock: true },
        });

        return JSON.parse(JSON.stringify(updatedStock, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value
        ));
    } catch (error) {
        console.error("Erreur lors de la mise à jour du stock :", error);
        throw error;
    }
}
