"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export function AccountForm({ utilisateur }: { utilisateur: { prenom: string; nom: string; email: string } }) {
    const { toast } = useToast();
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: utilisateur.prenom,
        lastName: utilisateur.nom,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field: string) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Gestion des erreurs avant envoi
        if (!formData.currentPassword && formData.newPassword !== "") {
            toast({ title: "Erreur", description: "Veuillez saisir votre mot de passe actuel.", variant: "destructive" });
            setLoading(false);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword && formData.newPassword !== "") {
            toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6 && formData.newPassword !== "") {
            toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
            setLoading(false);
            return;
        }

        try {
            // Appel API pour mettre à jour les informations utilisateur
            const response = await fetch("/api/account/update", {
                method: "POST",
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Mot de passe actuel incorrect.");
            }

            toast({ title: "Succès", description: "Votre compte a été mis à jour avec succès." });
            router.refresh();
        } catch (error: any) {
            console.error("Erreur :", error);
            toast({ title: "Erreur", description: "Une erreur s'est produite.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle>Gérer mon compte</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium">
                            Prénom
                        </label>
                        <Input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Votre prénom"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium">
                            Nom
                        </label>
                        <Input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Votre nom"
                        />
                    </div>
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium">
                            Mot de passe actuel
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword.currentPassword ? "text" : "password"}
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Mot de passe actuel"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                onClick={() => togglePasswordVisibility("currentPassword")}
                            >
                                {showPassword.currentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword.newPassword ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Nouveau mot de passe"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                onClick={() => togglePasswordVisibility("newPassword")}
                            >
                                {showPassword.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium">
                            Confirmer le nouveau mot de passe
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword.confirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirmez le mot de passe"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                onClick={() => togglePasswordVisibility("confirmPassword")}
                            >
                                {showPassword.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Mise à jour en cours..." : "Mettre à jour"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
