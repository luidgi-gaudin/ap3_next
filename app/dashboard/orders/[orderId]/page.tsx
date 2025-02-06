// app/orders/[orderId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Order {
    id_commande: number;
    date_commande: string;
    statut_commande: { name: string };
    utilisateur: { nom: string; prenom: string; email: string };
    details_commande: {
        id_stock: number;
        quantite: number;
        stock: { nom: string; description: string; quantite_disponible: number };
    }[];
}

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/orders/${orderId}`);
            if (!res.ok) throw new Error("Erreur lors de la récupération de la commande");
            const data = await res.json();
            setOrder(data.order);
        } catch (error: any) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) fetchOrder();
    }, [orderId]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "en attente":
                return "bg-yellow-500";
            case "en préparation":
                return "bg-blue-500";
            case "expédié":
                return "bg-green-500";
            case "terminé":
                return "bg-gray-500";
            case "annulé":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getNextStatus = (currentStatus: string) => {
        const mapping: { [key: string]: { next: number; label: string } | null } = {
            "en attente": { next: 2, label: "Passer en préparation" },
            "en préparation": {next: 3, label: "Passer à expédié"},
            "expédié": { next: 4, label: "Passer à terminé" },
        };
        return mapping[currentStatus.toLowerCase()] || null;
    };

    const handleUpdateStatus = async () => {
        if (!order) return;
        const nextStatus = getNextStatus(order.statut_commande.name);
        if (!nextStatus) {
            toast({ title: "Mise à jour impossible", description: "Aucune transition autorisée", variant: "destructive" });
            return;
        }
        try {
            const res = await fetch(`/api/orders/${order.id_commande}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newStatus: nextStatus.next }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erreur lors de la mise à jour du statut");
            }
            const data = await res.json();
            setOrder(data.order);
            toast({ title: "Statut mis à jour", description: `Commande passée au statut ${data.order.statut_commande.name}` });
        } catch (error: any) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;
        const confirmed = window.confirm("Êtes-vous sûr de vouloir annuler la commande ?");
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/orders/${order.id_commande}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newStatus: 5 }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erreur lors de l'annulation de la commande");
            }
            const data = await res.json();
            setOrder(data.order);
            toast({ title: "Commande annulée", description: "La commande a été annulée et les stocks ont été restaurés" });
        } catch (error: any) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        }
    };

    if (loading) return <p>Chargement...</p>;
    if (!order) return <p>Commande non trouvée.</p>;

    const nextStatus = getNextStatus(order.statut_commande.name);
    const currentStatus = order.statut_commande.name;

    return (
        <div className="container mx-auto p-4">
            <Link href="/dashboard/orders">
                <Button variant="outline" type="button">Retour aux commandes</Button>
            </Link>
            <Card className="mt-4">
                <CardHeader>
                    <div className="flex justify-between items-center w-full">
                        <CardTitle>Commande #{order.id_commande}</CardTitle>
                        <span className={`px-3 py-1 text-xs font-bold text-white ${getStatusColor(currentStatus)} rounded-full`}>
              {currentStatus}
            </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p>Date : {new Date(order.date_commande).toLocaleDateString()}</p>
                    <p>
                        Utilisateur : {order.utilisateur.prenom} {order.utilisateur.nom} ({order.utilisateur.email})
                    </p>
                    <h2 className="mt-4 text-lg font-bold">Détails de la commande</h2>
                    <ul className="list-disc ml-5">
                        {order.details_commande.map((detail) => (
                            <li key={detail.id_stock}>
                                {detail.stock.nom} – Quantité : {detail.quantite}
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter className="flex justify-items-end space-x-2">
                    {currentStatus.toLowerCase() === "en attente" && (

                        <Button variant="outline" onClick={() =>{router.push(`/dashboard/orders/${order.id_commande}/edit`)}} type="button">Modifier</Button>
                    )}
                        {currentStatus.toLowerCase() !== "annulé" || currentStatus.toLowerCase() !== "terminé" && (
                            <Button variant="destructive" onClick={handleCancelOrder} type="button">
                                Annuler la commande
                            </Button>
                        )}
                        {nextStatus && (
                            <Button onClick={handleUpdateStatus} type="button">
                                {nextStatus.label}
                            </Button>
                        )}
                </CardFooter>
            </Card>
        </div>
    );
}
