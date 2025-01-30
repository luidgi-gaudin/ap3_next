"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

type User = {
    prenom: string;
    nom: string;
    email: string;
};

type FormState = {
    firstName: string;
    lastName: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

type PasswordVisibility = {
    currentPassword: boolean;
    newPassword: boolean;
    confirmPassword: boolean;
};

export function AccountForm({ utilisateur }: { utilisateur: User }) {
    const { toast } = useToast();
    const router = useRouter();
    const [formData, setFormData] = useState<FormState>({
        firstName: utilisateur.prenom,
        lastName: utilisateur.nom,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState<PasswordVisibility>({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
        setShowPassword((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };

    const validateForm = () => {
        if (!formData.currentPassword && formData.newPassword) {
            toast({
                title: "Erreur",
                description: "Veuillez saisir votre mot de passe actuel.",
                variant: "destructive",
            });
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas.",
                variant: "destructive",
            });
            return false;
        }

        if (formData.newPassword.length < 6 && formData.newPassword !== "") {
            toast({
                title: "Erreur",
                description: "Le mot de passe doit contenir au moins 6 caractères.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Échec de la mise à jour du compte");
            }

            toast({
                title: "Succès",
                description: "Votre compte a été mis à jour avec succès.",
            });
            router.refresh();
        } catch (error) {
            console.error("Erreur :", error);
            toast({
                title: "Erreur",
                description: error instanceof Error
                    ? error.message
                    : "Une erreur s'est produite",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const PasswordInput = ({
                               field,
                               label,
                               placeholder,
                           }: {
        field: keyof PasswordVisibility;
        label: string;
        placeholder: string;
    }) => (
        <div>
            <label htmlFor={field} className="block text-sm font-medium">
                {label}
            </label>
            <div className="relative">
                <Input
                    type={showPassword[field] ? "text" : "password"}
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => togglePasswordVisibility(field)}
                    aria-label={`Toggle ${field} visibility`}
                >
                    {showPassword[field] ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <Card className="mx-auto mt-8 max-w-md">
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

                    <PasswordInput
                        field="currentPassword"
                        label="Mot de passe actuel"
                        placeholder="Mot de passe actuel"
                    />

                    <PasswordInput
                        field="newPassword"
                        label="Nouveau mot de passe"
                        placeholder="Nouveau mot de passe"
                    />

                    <PasswordInput
                        field="confirmPassword"
                        label="Confirmer le nouveau mot de passe"
                        placeholder="Confirmez le mot de passe"
                    />

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Mise à jour en cours..." : "Mettre à jour"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}