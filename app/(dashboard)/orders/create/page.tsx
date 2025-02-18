"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { FaTrash } from "react-icons/fa";
import { getUser } from "@/services/userService";

interface Stock {
    id_stock: number;
    nom: string;
    description: string;
    quantite_disponible: number;
}

interface CartItem extends Stock {
    quantite: number;
}

export default function NewOrderPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [inputQuantities, setInputQuantities] = useState<Record<number, number>>({});
    const [loadingStocks, setLoadingStocks] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                setLoadingStocks(true);
                const res = await fetch("/api/stocks");
                if (!res.ok) throw new Error("Erreur lors de la récupération des stocks");
                const data = await res.json();
                setStocks(data.stocks);
                const defaultQuantities: Record<number, number> = {};
                data.stocks.forEach((stock: Stock) => {
                    defaultQuantities[stock.id_stock] = 1;
                });
                setInputQuantities(defaultQuantities);
            } catch {
                toast({
                    title: "Erreur",
                    description: "Erreur lors du chargement des stocks",
                    variant: "destructive",
                });
            } finally {
                setLoadingStocks(false);
            }
        };
        fetchStocks();
    }, []);

    const handleQuantityChange = (id_stock: number, value: string) => {
        const quantite = Number(value);
        if (isNaN(quantite) || quantite < 0) return;
        setInputQuantities((prev) => ({ ...prev, [id_stock]: quantite }));
    };

    const addToCart = (stock: Stock) => {
        const quantite = inputQuantities[stock.id_stock] || 1;
        if (quantite <= 0) {
            toast({
                title: "Quantité invalide",
                description: "Veuillez saisir une quantité supérieure à 0",
                variant: "destructive",
            });
            return;
        }
        if (quantite > stock.quantite_disponible) {
            toast({
                title: "Quantité excessive",
                description: `La quantité demandée pour "${stock.nom}" dépasse la quantité disponible (${stock.quantite_disponible})`,
                variant: "destructive",
            });
            return;
        }
        const existing = cart.find((item) => item.id_stock === stock.id_stock);
        if (existing) {
            const newQuantite = existing.quantite + quantite;
            if (newQuantite > stock.quantite_disponible) {
                toast({
                    title: "Quantité excessive",
                    description: `La quantité totale demandée pour "${stock.nom}" dépasse la quantité disponible (${stock.quantite_disponible})`,
                    variant: "destructive",
                });
                return;
            }
            setCart(cart.map((item) =>
                item.id_stock === stock.id_stock ? { ...item, quantite: newQuantite } : item
            ));
        } else {
            setCart([...cart, { ...stock, quantite }]);
        }
        setInputQuantities((prev) => ({ ...prev, [stock.id_stock]: 1 }));
        toast({
            title: "Article ajouté",
            description: `${stock.nom} ajouté au panier`,
        });
    };

    const removeFromCart = (id_stock: number) => {
        setCart(cart.filter((item) => item.id_stock !== id_stock));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            toast({
                title: "Panier vide",
                description: "Votre panier est vide",
                variant: "destructive",
            });
            return;
        }
        setOrderLoading(true);
        try {
            const supabaseUser = await getUser();
            if (!supabaseUser) {
                throw new Error("Non authentifié");
            }

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart.map((item) => ({
                        id_stock: item.id_stock,
                        quantite: item.quantite
                    })),
                    supabaseUserId: supabaseUser.id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de la création de la commande");
            }
            toast({
                title: "Commande créée",
                description: "Votre commande a été créée avec succès",
            });
            router.push("/orders");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création de la commande";
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setOrderLoading(false);
        }
    };

    const filteredStocks = stocks.filter((stock) =>
        stock.nom.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto p-4">
            <Link href="/orders">
                <Button variant="outline" className="mb-4" type="button">
                    Retour aux commandes
                </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-4">Créer une commande</h1>
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Stocks disponibles</h2>
                        {loadingStocks ? (
                            <p>Chargement...</p>
                        ) : (
                            filteredStocks.map((stock) => (
                                stock.quantite_disponible !== 0 && (
                                    <Card key={stock.id_stock} className="mb-2">
                                        <CardHeader>
                                            <CardTitle>{stock.nom}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>{stock.description}</p>
                                            <p>Disponible : {stock.quantite_disponible}</p>
                                            <Input
                                                type="number"
                                                min="1"
                                                max={stock.quantite_disponible}
                                                value={inputQuantities[stock.id_stock] ?? 1}
                                                placeholder="Quantité"
                                                onChange={(e) => handleQuantityChange(stock.id_stock, e.target.value)}
                                                className="mt-2"
                                            />
                                        </CardContent>
                                        <CardFooter>
                                            <Button onClick={() => addToCart(stock)} type="button">
                                                Ajouter
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            ))
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Votre Panier</h2>
                        {cart.length === 0 ? (
                            <p>Votre panier est vide.</p>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr>
                                    <th className="border-b p-2">Produit</th>
                                    <th className="border-b p-2">Quantité</th>
                                    <th className="border-b p-2">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {cart.map((item) => (
                                    <tr key={item.id_stock}>
                                        <td className="border-b p-2">{item.nom}</td>
                                        <td className="border-b p-2">{item.quantite}</td>
                                        <td className="border-b p-2">
                                            <Button variant="destructive" onClick={() => removeFromCart(item.id_stock)} type="button">
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                        <div className="mt-4">
                            <Button type="submit" disabled={orderLoading}>
                                {orderLoading ? "Création en cours..." : "Valider la commande"}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
