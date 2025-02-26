"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getUser } from "@/services/userService";
import { useRouter } from "next/navigation";

interface Utilisateur {
    id: number;
    email: string;
    prenom: string;
    nom: string;
    supabase_id: string;
    role: {
        id_role: number;
        nom_role: string;
    };
}

export default function UpgradeAdminPage() {
    const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("tous");
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const { toast } = useToast();
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

    const fetchUtilisateurs = async () => {
        try {
            const response = await fetch("/api/utilisateurs/upgrade");
            if (!response.ok) throw new Error("Échec de la récupération des utilisateurs");
            const data = await response.json();
            setUtilisateurs(data.utilisateurs);
        } catch (err) {
            setError("Erreur lors de la récupération des utilisateurs");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkUserRole = async () => {
            const userData = await fetchUserData();
            if (!userData || userData.role.id_role !== 1) {
                router.push('/not-found');
            } else {
                setIsAdmin(true);
                fetchUtilisateurs();
            }
        };

        checkUserRole();
    }, [router]);

    const handleUpgradeToAdmin = async (supabase_id: string) => {
        try {
            const response = await fetch("/api/utilisateurs/upgrade", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ supabase_id, id_role: 1 }),
            });

            if (!response.ok) throw new Error("Échec de la mise à jour");

            toast({
                description: "Rôle mis à jour avec succès",
                variant: "default"
            });
            fetchUtilisateurs();
        } catch (err) {
            toast({
                title: "Erreur",
                description: "Erreur lors de la mise à jour du rôle",
                variant: "destructive"
            });
            console.error(err);
        }
    };

    const filteredUtilisateurs = utilisateurs.filter((utilisateur) => {
        const matchesSearch =
            utilisateur.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            utilisateur.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            utilisateur.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole =
            roleFilter === "tous" ||
            utilisateur.role.nom_role.toLowerCase() === roleFilter.toLowerCase();

        return matchesSearch && matchesRole;
    });

    if (!isAdmin || loading) return <div className="container mx-auto p-4">Chargement...</div>;
    if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">Gestion des Utilisateurs</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border rounded"
                    />
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrer par rôle" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tous">Tous</SelectItem>
                            <SelectItem value="administrateur">Administrateur</SelectItem>
                            <SelectItem value="utilisateur">Utilisateur</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUtilisateurs.map((utilisateur) => (
                    <Card key={utilisateur.id}>
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {utilisateur.prenom} {utilisateur.nom}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">{utilisateur.email}</p>
                            <p className="mt-2">
                                Rôle actuel: <span className="font-semibold">{utilisateur.role.nom_role}</span>
                            </p>
                        </CardContent>
                        <CardFooter>
                            {utilisateur.role.id_role !== 1 && (
                                <Button
                                    onClick={() => handleUpgradeToAdmin(utilisateur.supabase_id)}
                                    variant="outline"
                                >
                                    Promouvoir Administrateur
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}