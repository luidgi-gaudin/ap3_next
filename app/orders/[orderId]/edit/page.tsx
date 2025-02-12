"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Detail {
    id_stock: number;
    quantite: number;
    stock: { nom: string; description: string; quantite_disponible: number };
}

interface Order {
    id_commande: number;
    id_statut: string;
    statut_commande: { name: string };
    details_commande: Detail[];
}

export default function EditOrderPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [modifiedDetails, setModifiedDetails] = useState<Record<number, number>>({});

    useEffect(() => {
        async function fetchOrder() {
            try {
                setLoading(true);
                const res = await fetch(`/api/orders/${orderId}`);
                if (!res.ok) throw new Error("Erreur lors de la récupération de la commande");
                const json = await res.json();
                setOrder(json.order);
                const initDetails: Record<number, number> = {};
                json.order.details_commande.forEach((d: Detail) => {
                    initDetails[d.id_stock] = d.quantite;
                });
                setModifiedDetails(initDetails);
            } catch (error: unknown) {
                const errMsg = error instanceof Error ? error.message : "Erreur inconnue";
                toast({ title: "Erreur", description: errMsg, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        if (orderId) fetchOrder();
    }, [orderId]);

    const handleChange = (id_stock: number, value: string) => {
        const qty = Number(value);
        if (isNaN(qty) || qty < 0) return;
        setModifiedDetails((prev) => ({ ...prev, [id_stock]: qty }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        try {
            const res = await fetch(`/api/orders/${order.id_commande}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: Object.keys(modifiedDetails).map((id) => ({
                        id_stock: Number(id),
                        quantite: modifiedDetails[Number(id)]
                    }))
                }),
            });
            if (!res.ok) {
                const errRes = await res.json();
                throw new Error(errRes.error || "Erreur lors de la modification de la commande");
            }
            await res.json();
            toast({ title: "Commande modifiée", description: "La commande a été modifiée avec succès" });
            router.push(`/dashboard/orders/${order.id_commande}`);
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Erreur lors de la modification de la commande";
            toast({ title: "Erreur", description: errMsg, variant: "destructive" });
        }
    };

    if (loading) return <p>Chargement...</p>;
    if (!order) return <p>Commande non trouvée.</p>;
    if (order.statut_commande.name.toLowerCase() !== "en attente")
        return <p>La commande ne peut être modifiée que si elle est en statut &quot;en attente&quot;.</p>;

    return (
        <div className="container mx-auto p-4">
            <Link href={`/dashboard/orders/${order.id_commande}`}>
                <Button variant="outline" type="button">Retour aux détails</Button>
            </Link>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Modifier la commande #{order.id_commande}</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        {order.details_commande.map((detail) => (
                            <div key={detail.id_stock} className="flex items-center space-x-4 mb-4">
                                <span className="w-1/3">{detail.stock.nom}</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max={detail.stock.quantite_disponible + detail.quantite}
                                    value={modifiedDetails[detail.id_stock]}
                                    onChange={(e) => handleChange(detail.id_stock, e.target.value)}
                                    className="w-1/3"
                                />
                                <span className="w-1/3">Actuel : {detail.quantite}</span>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit">Modifier la commande</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
