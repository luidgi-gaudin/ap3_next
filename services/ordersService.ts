import { prisma } from "@/lib/prisma";
import utilisateurService from "@/services/utilisateurService";

interface OrderItem {
    id_stock: number;
    quantite: number;
}

export async function getOrdersData() {
    const orders = await prisma.commande.findMany({
        orderBy: { date_commande: "desc" },
        include: {
            statut_commande: true,
            utilisateur: true,
            details_commande: {
                include: {
                    stock: true,
                },
            },
        },
    });

    return { orders };
}

export async function createOrder({ items, supabaseUserId }: { items: OrderItem[]; supabaseUserId: string }) {
    try {
        const utilisateur = await utilisateurService.getUtilisateurBySupabaseId(supabaseUserId);
        if (!utilisateur) {
            throw new Error("Utilisateur non trouvé");
        }

        for (const item of items) {
            const stock = await prisma.stock.findUnique({
                where: { id_stock: item.id_stock },
            });

            if (!stock) {
                throw new Error(`Stock ${item.id_stock} non trouvé`);
            }

            if (stock.quantite_disponible < item.quantite) {
                throw new Error(`Quantité insuffisante pour ${stock.nom}`);
            }
        }

        const newOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.commande.create({
                data: {
                    id_utilisateur: utilisateur.id_utilisateur,
                    id_statut: BigInt(1),
                },
            });

            for (const item of items) {
                await tx.detailsCommande.create({
                    data: {
                        id_commande: order.id_commande,
                        id_stock: item.id_stock,
                        quantite: item.quantite,
                    },
                });

                await tx.stock.update({
                    where: { id_stock: item.id_stock },
                    data: { quantite_disponible: { decrement: item.quantite } },
                });

                await tx.mouvement.create({
                    data: {
                        id_stock: item.id_stock,
                        type_mouvement: "Création commande (retrait quantitée)",
                        quantite: item.quantite,
                        id_utilisateur: utilisateur.id_utilisateur,
                        id_commande: order.id_commande,
                    },
                });
            }

            return order;
        });

        return JSON.parse(JSON.stringify(newOrder, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value
        ));
    } catch (error) {
        console.error("Erreur lors de la création de la commande:", error);
        throw error;
    }
}

export async function updateOrderStatus(orderId: number, newStatus: number, supabaseUserId: string) {
    try {
        const utilisateur = await utilisateurService.getUtilisateurBySupabaseId(supabaseUserId);
        if (!utilisateur) {
            throw new Error("Utilisateur non trouvé");
        }

        const order = await prisma.$transaction(async (tx) => {
            const orderToUpdate = await tx.commande.findUnique({
                where: { id_commande: orderId },
                include: { details_commande: true },
            });
            if (!orderToUpdate) throw new Error("Commande non trouvée");

            if (newStatus === 5 && orderToUpdate.details_commande.length > 0) {
                for (const detail of orderToUpdate.details_commande) {
                    await tx.stock.update({
                        where: { id_stock: detail.id_stock },
                        data: { quantite_disponible: { increment: detail.quantite } },
                    });

                    await tx.mouvement.create({
                        data: {
                            id_stock: detail.id_stock,
                            type_mouvement: "Annulation commande (ajout quantitée)",
                            quantite: detail.quantite,
                            id_utilisateur: utilisateur.id_utilisateur,
                            id_commande: orderId,
                        },
                    });
                }
            }

            const updatedOrder = await tx.commande.update({
                where: { id_commande: orderId },
                data: { id_statut: BigInt(newStatus) },
                include: {
                    statut_commande: true,
                    utilisateur: true,
                    details_commande: { include: { stock: true } },
                },
            });
            return updatedOrder;
        });

        return JSON.parse(JSON.stringify(order, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value
        ));
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        throw error;
    }
}

export async function modifyOrder(orderId: number, items: { id_stock: number; quantite: number }[], supabaseUserId: string) {
    try {
        const utilisateur = await utilisateurService.getUtilisateurBySupabaseId(supabaseUserId);
        if (!utilisateur) {
            throw new Error("Utilisateur non trouvé");
        }

        const order = await prisma.commande.findUnique({
            where: { id_commande: orderId },
            include: { details_commande: true },
        });
        if (!order) throw new Error("Commande non trouvée");
        if (order.id_statut !== BigInt(1)) throw new Error("La commande n'est pas modifiable");

        const updatedOrder = await prisma.$transaction(async (tx) => { for (const newItem of items) {
            const detail = order.details_commande.find(d => d.id_stock === newItem.id_stock);
            if (!detail) throw new Error(`Détail pour le stock ${newItem.id_stock} non trouvé`);

            const currentQuantity = detail.quantite;
            const diff = newItem.quantite - currentQuantity;

            if (diff !== 0) {
                if (diff > 0) {
                    const stock = await tx.stock.findUnique({ where: { id_stock: newItem.id_stock } });
                    if (!stock) throw new Error(`Stock ${newItem.id_stock} introuvable`);
                    if (stock.quantite_disponible < diff) throw new Error(`Quantité insuffisante pour ${stock.nom}`);
                    await tx.stock.update({
                        where: { id_stock: newItem.id_stock },
                        data: { quantite_disponible: { decrement: diff } },
                    });
                } else {
                    await tx.stock.update({
                        where: { id_stock: newItem.id_stock },
                        data: { quantite_disponible: { increment: -diff } },
                    });
                }

                await tx.mouvement.create({
                    data: {
                        id_stock: newItem.id_stock,
                        type_mouvement: diff > 0 ? "Modification commande (retrait quantitée)" : "Modification commande (ajout quantitée)",
                        quantite: Math.abs(diff),
                        id_utilisateur: utilisateur.id_utilisateur,
                        id_commande: orderId,
                    },
                });
            }

            await tx.detailsCommande.update({
                where: { id_commande_id_stock: { id_commande: orderId, id_stock: newItem.id_stock } },
                data: { quantite: newItem.quantite },
            });
        }

            return await tx.commande.findUnique({
                where: { id_commande: orderId },
                include: {
                    statut_commande: true,
                    utilisateur: true,
                    details_commande: { include: { stock: true } },
                },
            });
        });

        return JSON.parse(JSON.stringify(updatedOrder, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value
        ));
    } catch (error) {
        console.error("Erreur lors de la modification de la commande:", error);
        throw error;
    }
}

export async function getOrderById(orderId: number) {
    const order = await prisma.commande.findUnique({
        where: { id_commande: orderId },
        include: {
            statut_commande: true,
            utilisateur: true,
            details_commande: { include: { stock: true } },
        },
    });
    if (!order) throw new Error("Commande non trouvée");
    return order;
}

export async function getStatuses() {
    const statuses = await prisma.statut_commande.findMany();
    return statuses;
}
