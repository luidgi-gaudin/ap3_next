import { prisma } from "@/lib/prisma";

export async function getStocksData() {
    const stocks = await prisma.stock.findMany({
        orderBy: { id_stock: "asc" },
        include: {
            TypeStock: true,
            details_commande: true
        },
    });

    const stocksWithCanDelete = stocks.map(stock => ({
        ...stock,
        canDelete: stock.details_commande.length === 0,
        details_commande: undefined
    }));

    return JSON.parse(JSON.stringify(stocksWithCanDelete, (_key, value) =>
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

export async function deleteStock(stockId: number) {
    try {
        // Check if stock is linked to any orders
        const linkedOrders = await prisma.detailsCommande.findFirst({
            where: { id_stock: stockId },
        });

        if (linkedOrders) {
            throw new Error("Ce stock ne peut pas être supprimé car il est lié à des commandes");
        }

        await prisma.stock.delete({
            where: { id_stock: stockId },
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du stock :", error);
        throw error;
    }
}

export async function createStock(data: {
    nom: string;
    description: string;
    id_type_stock: number;
    quantite_disponible: number;
}) {
    try {
        const stock = await prisma.stock.create({
            data,
            include: { TypeStock: true },
        });
        return JSON.parse(JSON.stringify(stock, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value
        ));
    } catch (error) {
        console.error("Erreur lors de la création du stock:", error);
        throw error;
    }
}
