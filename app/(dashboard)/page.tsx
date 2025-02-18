"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    BarChart,
    Bar,
    LabelList,
    YAxis,
} from "recharts";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

type DashboardData = {
    ordersByDay: { day: string; count: number }[];
    stockByType: { type: string; totalQuantity: number }[];
    lastMovements: {
        id_mouvement: number;
        id_stock: number;
        type_mouvement: string;
        quantite: number;
        date_mouvement: string;
        id_commande: number;
        stock?: { nom: string };
        utilisateur?: { nom: string; prenom: string };
    }[];
    lastOrders: {
        id_commande: number;
        id_utilisateur: number;
        date_commande: string;
        statut_commande?: { name: string };
        utilisateur?: { nom: string; prenom: string };
    }[];
};

function DashboardSkeleton() {
    return (
        <div className="p-4 min-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-1/2 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 bg-gray-300 rounded"></div>
                    </CardContent>
                </Card>
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-1/2 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 bg-gray-300 rounded"></div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-32 bg-gray-300 rounded"></div>
                    </CardContent>
                </Card>
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-32 skeletton-dashboard bg-gray-300 rounded"></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/dashboard");
                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }
                const json = await response.json();
                setData(json.dashboard);
                setError(null);
            } catch (err) {
                console.error("Erreur lors du chargement des données du dashboard :", err);
                setError("Erreur lors du chargement des données du dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-500">{error || "Erreur inconnue"}</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
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

    const ordersChartData = data.ordersByDay.map((item) => ({
        day: item.day,
        orders: item.count,
    }));

    const ordersChartConfig: ChartConfig = {
        orders: {
            label: "Commandes",
            color: "hsl(var(--chart-1))",
        },
    };

    const stockChartData = data.stockByType.map((item) => ({
        type: item.type,
        quantity: item.totalQuantity,
    }));

    const stockChartConfig: ChartConfig = {
        stock: {
            label: "Stock",
            color: "hsl(var(--chart-2))",
        },
        label: {
            color: "hsl(var(--background))",
        },
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-7xl mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Commandes par jour</CardTitle>
                        <CardDescription>Les commandes des 7 derniers jours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={ordersChartConfig}>
                            <AreaChart data={ordersChartData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value: string) => value.slice(5)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Area
                                    dataKey="orders"
                                    type="natural"
                                    fill="var(--color-orders)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-orders)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock par type</CardTitle>
                        <CardDescription>Quantité disponible par type de stock</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={stockChartConfig}>
                            <BarChart data={stockChartData} layout="vertical" margin={{ right: 16 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis
                                    dataKey="type"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value: string) => value.slice(0, 3)}
                                    hide
                                />
                                <XAxis dataKey="quantity" type="number" hide />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <Bar dataKey="quantity" layout="vertical" fill="var(--color-stock)" radius={4}>
                                    <LabelList
                                        dataKey="type"
                                        position="insideLeft"
                                        offset={8}
                                        className="fill-[--color-label]"
                                        fontSize={12}
                                    />
                                    <LabelList
                                        dataKey="quantity"
                                        position="right"
                                        offset={8}
                                        className="fill-foreground"
                                        fontSize={12}
                                    />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full max-w-7xl">
                <Card>
                    <CardHeader>
                        <CardTitle>10 derniers mouvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produit</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Quantité</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>ID Commande</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.lastMovements.map((mouvement) => (
                                        <TableRow key={mouvement.id_mouvement} className="cursor-pointer hover:cursor-pointer">
                                            <TableCell>{mouvement.stock ? mouvement.stock.nom : "-"}</TableCell>
                                            <TableCell>{mouvement.type_mouvement}</TableCell>
                                            <TableCell>{mouvement.quantite}</TableCell>
                                            <TableCell>{new Date(mouvement.date_mouvement).toLocaleString()}</TableCell>
                                            <TableCell>
                                                {mouvement.utilisateur
                                                    ? `${mouvement.utilisateur.nom} ${mouvement.utilisateur.prenom}`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>{mouvement.id_commande}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>5 dernières commandes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID Commande</TableHead>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Statut</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.lastOrders.map((commande) => (
                                        <TableRow
                                            key={commande.id_commande}
                                            onClick={() =>
                                                router.push(`/orders/${commande.id_commande}`)
                                            }
                                            className="cursor-pointer hover:cursor-pointer"
                                        >
                                            <TableCell>{commande.id_commande}</TableCell>
                                            <TableCell>
                                                {commande.utilisateur
                                                    ? `${commande.utilisateur.nom} ${commande.utilisateur.prenom}`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(commande.date_commande).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {commande.statut_commande?.name ? (
                                                    <span
                                                        className={`px-2 py-1 text-xs font-bold text-white rounded-full ${
                                                            getStatusColor(commande.statut_commande.name)
                                                        }`}
                                                    >
                            {commande.statut_commande.name}
                          </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
