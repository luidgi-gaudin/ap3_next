"use client";

import * as React from "react";

// Framer Motion pour les animations
import { AnimatePresence, motion } from "framer-motion";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons lucide
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

// Exemples d'actions côté serveur (à adapter à ton code)
import { login, signup } from "@/app/login/actions";

// Exemple de type "Role"
type Role = {
    id_role: number;
    nom_role: string;
};
function Logo() {
    return (
        <div className="flex flex-col items-center">
            {/* Un petit cercle avec un "G" */}
            <div className="relative mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
                <span className="text-xl font-semibold">G</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-wide">
                Gestock
            </h1>
        </div>
    );
}

function LoginForm({
                       showPassword,
                       togglePasswordVisibility,
                   }: {
    showPassword: boolean;
    togglePasswordVisibility: () => void;
}) {
    return (
        <motion.form
            // Clé unique pour AnimatePresence
            key="loginForm"
            // Variants d’animation Framer Motion
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            {/* Email */}
            <div className="mb-4">
                <Label htmlFor="emailLogin" className="text-sm font-medium text-gray-800">
                    Adresse e-mail
                </Label>
                <div className="relative mt-1">
                    <Mail className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                        id="emailLogin"
                        name="email"
                        type="email"
                        placeholder="exemple@apple.com"
                        className="pl-8"
                        required
                    />
                </div>
            </div>

            {/* Mot de passe */}
            <div className="mb-6">
                <Label htmlFor="passwordLogin" className="text-sm font-medium text-gray-800">
                    Mot de passe
                </Label>
                <div className="relative mt-1">
                    <Lock className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                        id="passwordLogin"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-8 pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            <Button
                formAction={login}
                type="submit"
                className="w-full font-medium"
            >
                Se connecter
            </Button>
        </motion.form>
    );
}

function SignUpForm({
                        showPassword,
                        togglePasswordVisibility,
                        roles,
                        rolesError,
                        isLoadingRole,
                    }: {
    showPassword: boolean;
    togglePasswordVisibility: () => void;
    roles: Role[];
    rolesError: string | null;
    isLoadingRole: boolean;
}) {
    return (
        <motion.form
            key="signupForm"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
        >
            {/* Prénom */}
            <div className="mb-4">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-800">
                    Prénom
                </Label>
                <div className="relative mt-1">
                    <User className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Jean"
                        className="pl-8"
                        required
                    />
                </div>
            </div>

            {/* Nom */}
            <div className="mb-4">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-800">
                    Nom
                </Label>
                <div className="relative mt-1">
                    <User className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Dupont"
                        className="pl-8"
                        required
                    />
                </div>
            </div>

            {/* Rôle */}
            <div className="mb-4">
                <Label htmlFor="role" className="text-sm font-medium text-gray-800">
                    Rôle
                </Label>
                <div className="relative mt-1">
                    {isLoadingRole ? (
                        <p className="text-sm text-gray-500">Chargement des rôles...</p>
                    ) : rolesError ? (
                        <p className="text-sm text-red-500">{rolesError}</p>
                    ) : (
                        <select
                            id="role"
                            name="role"
                            required
                            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                            {roles.map((role) => (
                                <option key={role.id_role} value={role.id_role}>
                                    {role.nom_role}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Email */}
            <div className="mb-4">
                <Label htmlFor="emailSignup" className="text-sm font-medium text-gray-800">
                    Adresse e-mail
                </Label>
                <div className="relative mt-1">
                    <Mail className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                        id="emailSignup"
                        name="email"
                        type="email"
                        placeholder="exemple@apple.com"
                        className="pl-8"
                        required
                    />
                </div>
            </div>

            {/* Mot de passe */}
            <div className="mb-6">
                <Label htmlFor="passwordSignup" className="text-sm font-medium text-gray-800">
                    Mot de passe
                </Label>
                <div className="relative mt-1">
                    <Lock className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                        id="passwordSignup"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-8 pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            <Button
                formAction={signup}
                type="submit"
                className="w-full font-medium"
            >
                S&apos;inscrire
            </Button>
        </motion.form>
    );
}

export default function AuthPage() {
    const [isLogin, setIsLogin] = React.useState(true);
    const [showPassword, setShowPassword] = React.useState(false);

    const [roles, setRoles] = React.useState<Role[]>([]);
    const [isLoadingRole, setIsLoadingRole] = React.useState(true);
    const [rolesError, setRolesError] = React.useState<string | null>(null);

    // Chargement des rôles depuis l'API
    React.useEffect(() => {
        const fetchRoles = async () => {
            try {
                setIsLoadingRole(true);
                const response = await fetch("/api/roles");
                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }
                const data: Role[] = await response.json();
                setRoles(data);
                setRolesError(null);
            } catch (error: any) {
                setRolesError(`Erreur lors du chargement des rôles: ${error.message}`);
            } finally {
                setIsLoadingRole(false);
            }
        };
        fetchRoles();
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 px-4">
            {/* Logo */}
            <Logo />

            {/* Card : on encapsule le tout dans un conteneur blanc */}
            <div className="relative mt-10 w-full max-w-md rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-100">
                {/* Switch Connexion / Inscription */}
                <div className="mb-6 flex space-x-2">
                    <Button
                        variant={isLogin ? "default" : "secondary"}
                        onClick={() => setIsLogin(true)}
                        className="w-1/2"
                    >
                        Connexion
                    </Button>
                    <Button
                        variant={!isLogin ? "default" : "secondary"}
                        onClick={() => setIsLogin(false)}
                        className="w-1/2"
                    >
                        Inscription
                    </Button>
                </div>

                {/* AnimatePresence pour gérer la transition entre les deux formulaires */}
                <div className="relative min-h-[320px]">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <LoginForm
                                showPassword={showPassword}
                                togglePasswordVisibility={togglePasswordVisibility}
                            />
                        ) : (
                            <SignUpForm
                                showPassword={showPassword}
                                togglePasswordVisibility={togglePasswordVisibility}
                                roles={roles}
                                rolesError={rolesError}
                                isLoadingRole={isLoadingRole}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
