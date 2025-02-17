"use client";

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getUser } from "@/services/userService";

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

interface Utilisateur {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
    role: { nom_role: string };
}

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<Utilisateur | null>(null);

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/orders/${orderId}`);
            if (!res.ok) throw new Error("Erreur lors de la récupération de la commande");
            const json = await res.json();
            setOrder(json.order);
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Erreur inconnue";
            toast({ title: "Erreur", description: errMsg, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const fetchUserData = async () => {
        try {
            const supabaseUser = await getUser();
            if (!supabaseUser) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(`/api/utilisateurs?supabase_id=${supabaseUser.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const userData = await response.json();
            return userData;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (orderId) fetchOrder();
    }, [orderId, fetchOrder]);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const userData = await fetchUserData();
                setUser(userData);
            } catch (error) {
                console.error("Error:", error);
            }
        };

        getUserData();
    }, []);

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case "en attente":
                return "bg-yellow-500";
            case "en préparation":
                return "bg-blue-500";
            case "expédiée":
                return "bg-green-500";
            case "terminée":
                return "bg-gray-500";
            case "annulée":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getNextStatus = (currentStatus: string) => {
        const mapping: { [key: string]: { next: number; label: string } | null } = {
            "en attente": { next: 2, label: "Passer en préparation" },
            "en préparation": { next: 3, label: "Passer à expédiée" },
            "expédiée": { next: 4, label: "Passer à terminée" },
        };
        return mapping[currentStatus.toLowerCase()] || null;
    };

    const handleUpdateStatus = async () => {
        if (!order) return;
        const nextStatus = getNextStatus(order.statut_commande.name);
        if (!nextStatus) {
            toast({
                title: "Mise à jour impossible",
                description: "Aucune transition autorisée",
                variant: "destructive",
            });
            return;
        }
        try {
            const res = await fetch(`/api/orders/${order.id_commande}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newStatus: nextStatus.next }),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Erreur lors de la mise à jour du statut");
            }
            const json = await res.json();
            setOrder(json.order);
            toast({
                title: "Statut mis à jour",
                description: `Commande passée au statut ${json.order.statut_commande.name}`,
            });
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Erreur inconnue";
            toast({ title: "Erreur", description: errMsg, variant: "destructive" });
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
                const json = await res.json();
                throw new Error(json.error || "Erreur lors de l'annulation de la commande");
            }
            const json = await res.json();
            setOrder(json.order);
            toast({
                title: "Commande annulée",
                description: "La commande a été annulée et les stocks ont été restaurés",
            });
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Erreur inconnue";
            toast({ title: "Erreur", description: errMsg, variant: "destructive" });
        }
    };

    if (loading) return <p>Chargement...</p>;
    if (!order) return <p>Commande non trouvée.</p>;

    const nextStatus = getNextStatus(order.statut_commande.name);
    const currentStatus = order.statut_commande.name;

    return (
        <div className="container mx-auto p-4">
            <Link href="/orders">
                <Button variant="outline" type="button">
                    Retour aux commandes
                </Button>
            </Link>
            <Card className="mt-4">
                <CardHeader>
                    <div className="flex justify-between items-center w-full">
                        <CardTitle>Commande #{order.id_commande}</CardTitle>
                        <span
                            className={`px-3 py-1 text-xs font-bold text-white ${getStatusColor(
                                currentStatus
                            )} rounded-full`}
                        >
                            {currentStatus}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p>Date : {new Date(order.date_commande).toLocaleDateString()}</p>
                    <p>
                        Utilisateur : {order.utilisateur.prenom} {order.utilisateur.nom} (
                        {order.utilisateur.email})
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
                <CardFooter className="flex justify-end space-x-2">
                    {currentStatus.toLowerCase() === "en attente" && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                router.push(`/orders/${order.id_commande}/edit`);
                            }}
                            type="button"
                        >
                            Modifier
                        </Button>
                    )}
                    {((user?.role.nom_role === "Administrateur") ||
                        (currentStatus.toLowerCase() === "en attente")) && (
                        <Button variant="destructive" onClick={handleCancelOrder} type="button">
                            Annuler la commande
                        </Button>
                    )}
                    {(nextStatus && user?.role.nom_role === "Administrateur") && (
                        <Button onClick={handleUpdateStatus} type="button">
                            {nextStatus.label}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
