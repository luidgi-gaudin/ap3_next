// services/dashboardService.ts
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
    // Stock groupé par type
    const stockData = await prisma.stock.groupBy({
        by: ["id_type_stock"],
        _sum: { quantite_disponible: true },
    });
    const types = await prisma.typeStock.findMany();
    const stockByType = stockData.map((item) => {
        const type = types.find((t) => t.id === item.id_type_stock);
        return {
            type: type?.nom_type || "Inconnu",
            totalQuantity: item._sum.quantite_disponible || 0,
        };
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const orders = await prisma.commande.findMany({
        where: { date_commande: { gte: sevenDaysAgo } },
        select: { date_commande: true },
    });
    const ordersByDayMap: Record<string, number> = {};
    orders.forEach((order) => {
        const day = order.date_commande.toISOString().split("T")[0];
        ordersByDayMap[day] = (ordersByDayMap[day] || 0) + 1;
    });
    const ordersByDay = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const day = date.toISOString().split("T")[0];
        ordersByDay.push({ day, count: ordersByDayMap[day] || 0 });
    }
    ordersByDay.reverse();

    // 10 derniers mouvements avec toutes les infos (selon le schéma)
    const lastMovements = await prisma.mouvement.findMany({
        orderBy: { date_mouvement: "desc" },
        take: 10,
        include: {
            stock: true,
            utilisateur: true
        },
    });

    // 5 dernières commandes avec toutes les infos et en incluant l'utilisateur associé
    const lastOrders = await prisma.commande.findMany({
        orderBy: { date_commande: "desc" },
        take: 5,
        include: {
            utilisateur: true,
        },
    });

    return {
        stockByType,
        ordersByDay,
        lastMovements,
        lastOrders,
    };
}
