import { prisma } from "@/lib/prisma"

export async function getAllTypeStock() {
    const typeStock = await prisma.typeStock.findMany({
        orderBy: {id: "asc"}
    })
    return JSON.parse(JSON.stringify(typeStock, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value
    ));
}