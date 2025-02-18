"use client"

import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface TypeStock {
    id: number;
    nom_type: string;
}

export default function AddStockPage() {
    const [loading, setLoading] = useState(false);
    const [types, setTypes] = useState<TypeStock[]>([]);
    const [formData, setFormData] = useState({
        nom: "",
        description: "",
        id_type_stock: "",
    });
    const router = useRouter();

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await fetch("/api/typeStock");
                const data = await response.json();
                setTypes(data.typeStocks);
            } catch (error) {
                console.error("Error fetching stock types:", error);
            }
        };
        fetchTypes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/stocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to create stock");
            router.push("/stock");
        } catch (error) {
            console.error("Error creating stock:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Créer un nouveau stock</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                <div>
                    <label className="block mb-2">Nom</label>
                    <Input
                        required
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block mb-2">Description</label>
                    <Input
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block mb-2">Type de stock</label>
                    <Select
                        value={formData.id_type_stock}
                        onValueChange={(value) => setFormData({ ...formData, id_type_stock: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                            {types.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.nom_type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? "Création..." : "Créer le stock"}
                </Button>
            </form>
        </div>
    );
}