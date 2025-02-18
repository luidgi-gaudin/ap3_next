"use client"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { getUser } from "@/services/userService";

interface Stock {
    id_stock: number;
    nom: string;
    description: string;
    quantite_disponible: number;
    id_type_stock: string;
    canDelete: boolean;
    TypeStock: { nom_type: string };
}

export default function StockPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [quantityToAdd, setQuantityToAdd] = useState<number>(0);
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    const router = useRouter();

    const handleDeleteStock = async (stockId: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce stock ?")) return;

        try {
            const response = await fetch(`/api/stocks/${stockId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            fetchStocks();
        } catch (err) {
            console.error("Erreur lors de la suppression du stock :", err);
        }
    };

    const fetchStocks = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/stocks");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const json = await response.json();
            setStocks(json.stocks);
            setFilteredStocks(json.stocks);
            setError(null);
        } catch (err) {
            console.error("Erreur lors de la récupération des stocks :", err);
            setError("Erreur lors de la récupération des stocks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    useEffect(() => {
        const results = stocks.filter(stock =>
            stock.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStocks(results);
    }, [searchTerm, stocks]);

    const handleAddStock = async (stockId: number, quantity: number) => {
        try {
            const supabaseUser = await getUser();
            if (!supabaseUser) {
                throw new Error("Non authentifié");
            }

            const response = await fetch(`/api/stocks/${stockId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantityToAdd: quantity,
                    supabaseUserId: supabaseUser.id
                }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            fetchStocks();
            setIsPopupOpen(false);
        } catch (err) {
            console.error("Erreur lors de l'ajout du stock :", err);
        }
    };


    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">Stock</h1>
                <div className="flex items-center space-x-4">
                        <Button onClick={() => (router.push("/stock/add"))}>Créer un produit</Button>
                </div>
            </div>
            <Input
                type="text"
                placeholder="Rechercher un stock..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
            />
            {error && <p className="text-red-500">{error}</p>}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type de stock</TableHead>
                        <TableHead>Quantité disponible</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <TableCell key={index}>
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="flex-1 space-y-4 py-1">
                                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        filteredStocks.map((stock) => (
                            <TableRow key={stock.id_stock}>
                                <TableCell>{stock.nom}</TableCell>
                                <TableCell>{stock.description}</TableCell>
                                <TableCell>{stock.TypeStock.nom_type}</TableCell>
                                <TableCell>{stock.quantite_disponible}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => {
                                            setSelectedStock(stock);
                                            setIsPopupOpen(true);
                                        }}>
                                            Ajouter du stock
                                        </Button>
                                        {stock.canDelete && (
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDeleteStock(stock.id_stock)}
                                            >
                                                Supprimer
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                    {!loading && filteredStocks.length === 0 && <p>Aucun stock trouvé.</p>}
                </TableBody>
            </Table>
            {isPopupOpen && selectedStock && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Ajouter du stock pour {selectedStock.nom}</h2>
                        <Input
                            type="number"
                            value={quantityToAdd}
                            onChange={(e) => setQuantityToAdd(Number(e.target.value))}
                            className="mb-4"
                        />
                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" onClick={() => setIsPopupOpen(false)}>Annuler</Button>
                            <Button onClick={() => handleAddStock(selectedStock.id_stock, quantityToAdd)}>Ajouter</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
