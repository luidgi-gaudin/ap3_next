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
