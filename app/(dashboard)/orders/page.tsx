"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
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

interface Status {
    id: number;
    name: string;
}

export default function OrderPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("tous");
    const router = useRouter();

    const fetchUserData = async () => {
        try {
            const supabaseUser = await getUser();
            if (!supabaseUser) {
                router.push('/login');
                return null;
            }

            const response = await fetch(`/api/utilisateurs?supabase_id=${supabaseUser.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching user:", error);
            setError("Erreur lors de la récupération des données utilisateur");
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userData = await fetchUserData();

                if (!userData) return;

                const [ordersResponse, statusesResponse] = await Promise.all([
                    fetch("/api/orders"),
                    fetch("/api/orders/statuses")
                ]);

                console.log(ordersResponse);
                console.log(statusesResponse);

                if (!ordersResponse.ok || !statusesResponse.ok) {
                    throw new Error("Failed to fetch data");
                }

                const ordersData = await ordersResponse.json();
                const statusesData = await statusesResponse.json();

                const filteredOrders = userData.role.id_role === 1
                    ? ordersData.orders
                    : ordersData.orders.filter((order: Order) => order.utilisateur.email === userData.email);

                setOrders(filteredOrders);
                setStatuses(statusesData.statuses);
                setError(null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Erreur lors de la récupération des données");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "en attente": return "bg-yellow-500";
            case "en préparation": return "bg-blue-500";
            case "expédié": return "bg-green-500";
            case "terminée": return "bg-gray-500";
            case "annulée": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (!order) return false;

        const matchesSearch =
            order.utilisateur.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.utilisateur.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id_commande.toString().includes(searchQuery);

        const matchesStatus =
            statusFilter === "tous" ||
            order.statut_commande?.name.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="container mx-auto p-4">Chargement...</div>;
    if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

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
                            <SelectItem value="tous">Tous</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status.id} value={status.name}>
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

            {filteredOrders.length === 0 ? (
                <p>Aucune commande trouvée.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.map((order) => (
                        <Card key={order.id_commande} className="relative">
                            <CardHeader className="flex justify-between items-center">
                                <CardTitle>Commande #{order.id_commande}</CardTitle>
                                <span className={`px-3 py-1 text-xs font-bold text-white ${getStatusColor(order.statut_commande.name)} rounded-full`}>
                                    {order.statut_commande.name}
                                </span>
                            </CardHeader>
                            <CardContent>
                                <p>Date : {new Date(order.date_commande).toLocaleDateString()}</p>
                                <p>Utilisateur : {order.utilisateur.prenom} {order.utilisateur.nom}</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" onClick={() => router.push(`/orders/${order.id_commande}`)}>
                                    Détails
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}