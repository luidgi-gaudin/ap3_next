import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import utilisateurService from "@/services/utilisateurService";

interface OrderItem {
    id_stock: number;
    quantite: number;
}

interface CreateOrderInput {
    items: OrderItem[];
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

export async function createOrder({ items }: CreateOrderInput) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect('/login');
    }
    const utilisateur = await utilisateurService.getUtilisateurBySupabaseId(data.user.id);
    if (!utilisateur) {
        throw new Error("Utilisateur non trouvé");
    }

    for (const item of items) {
        const stock = await prisma.stock.findUnique({
            where: { id_stock: item.id_stock },
        });
        if (!stock) {
            throw new Error(`Stock introuvable pour l'article ${item.id_stock}`);
        }
        if (stock.quantite_disponible < item.quantite) {
            throw new Error(`Quantité demandée pour "${stock.nom}" dépasse la quantité disponible (${stock.quantite_disponible})`);
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
        }

        return order;
    });

    return newOrder;
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

export async function updateOrderStatus(orderId: number, newStatus: number) {
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
    return order;
}


export async function modifyOrder(orderId: number, items: { id_stock: number; quantite: number }[]) {
    const order = await prisma.commande.findUnique({
        where: { id_commande: orderId },
        include: { details_commande: true },
    });
    if (!order) throw new Error("Commande non trouvée");
    if (order.id_statut !== BigInt(1)) throw new Error("La commande n'est pas modifiable");

    const updatedOrder = await prisma.$transaction(async (tx) => {
        for (const newItem of items) {
            const detail = order.details_commande.find(d => d.id_stock === newItem.id_stock);
            if (!detail) throw new Error(`Détail pour le stock ${newItem.id_stock} non trouvé`);
            const currentQuantity = detail.quantite;
            const diff = newItem.quantite - currentQuantity;
            if (diff > 0) {
                const stock = await tx.stock.findUnique({ where: { id_stock: newItem.id_stock } });
                if (!stock) throw new Error(`Stock ${newItem.id_stock} introuvable`);
                if (stock.quantite_disponible < diff) throw new Error(`Quantité insuffisante pour ${stock.nom}`);
                await tx.stock.update({
                    where: { id_stock: newItem.id_stock },
                    data: { quantite_disponible: { decrement: diff } },
                });
            } else if (diff < 0) {
                await tx.stock.update({
                    where: { id_stock: newItem.id_stock },
                    data: { quantite_disponible: { increment: -diff } },
                });
            }
            await tx.detailsCommande.update({
                where: { id_commande_id_stock: { id_commande: orderId, id_stock: newItem.id_stock } },
                data: { quantite: newItem.quantite },
            });
        }
        const refreshedOrder = await tx.commande.findUnique({
            where: { id_commande: orderId },
            include: {
                statut_commande: true,
                utilisateur: true,
                details_commande: { include: { stock: true } },
            },
        });
        return refreshedOrder;
    });
    if (!updatedOrder) throw new Error("Erreur lors de la mise à jour de la commande");
    return updatedOrder;
}