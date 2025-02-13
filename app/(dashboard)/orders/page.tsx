"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

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

interface Status {
    id_statut: number;
    name: string;
}

export default function OrderPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("tous");
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/orders");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const json = await response.json();
                setOrders(json.orders);
                setError(null);
            } catch (err) {
                console.error("Erreur lors de la récupération des commandes :", err);
                setError("Erreur lors de la récupération des commandes");
            } finally {
                setLoading(false);
            }
        };

        const fetchStatuses = async () => {
            try {
                const response = await fetch("/api/orders/statuses");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const json = await response.json();
                setStatuses(json.statuses);
            } catch (err) {
                console.error("Erreur lors de la récupération des statuts :", err);
            }
        };

        fetchOrders();
        fetchStatuses();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "en attente":
                return "bg-yellow-500";
            case "en préparation":
                return "bg-blue-500";
            case "expédié":
                return "bg-green-500";
            case "terminée":
                return "bg-gray-500";
            case "annulée":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.utilisateur.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.utilisateur.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id_commande.toString().includes(searchQuery);

        const matchesStatus = statusFilter === "tous" || order.statut_commande.name.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">Commandes</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border rounded"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="tous" value="tous">Tous</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status.id_statut} value={status.name}>
                                    {status.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Link href="/orders/create">
                        <Button>Créer une commande</Button>
                    </Link>
                </div>
            </div>
            {loading && <p>Chargement...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && filteredOrders.length === 0 && <p>Aucune commande trouvée.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => (
                    <Card key={order.id_commande} className="relative">
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>Commande #{order.id_commande}</CardTitle>
                            <span
                                className={`px-3 py-1 text-xs font-bold text-white ${getStatusColor(
                                    order.statut_commande.name
                                )} rounded-full`}
                            >
                                {order.statut_commande.name}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <p>Date : {new Date(order.date_commande).toLocaleDateString()}</p>
                            <p>
                                Utilisateur : {order.utilisateur.prenom} {order.utilisateur.nom}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" onClick={() => router.push(`/orders/${order.id_commande}`)}>
                                Détails
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
