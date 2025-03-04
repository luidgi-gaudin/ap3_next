"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { login, signup } from "@/app/(app)/login/actions";
import Logo from "@/components/Login/Logo";
import { Toaster } from "@/components/ui/toaster";
import { useToast} from "@/hooks/use-toast";
import {useSearchParams} from "next/navigation";
import {Suspense, useEffect} from "react";

type LoginFormProps = {
    showPassword: boolean;
    togglePasswordVisibility: () => void;
    onError: (message: string) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ showPassword, togglePasswordVisibility, onError }) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const result = await login(formData);
        if (result.error) {
            onError(result.error);
        }
    };

    return (
        <motion.form
            key="loginForm"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            noValidate
            onSubmit={handleSubmit}
        >
            {/* Champ Email */}
            <div className="mb-4">
                <Label htmlFor="emailLogin" className="text-sm font-medium ">
                    Adresse e-mail
                </Label>
                <div className="relative mt-1">
                    <Mail className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 " />
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

            {/* Champ Mot de passe */}
            <div className="mb-6">
                <Label htmlFor="passwordLogin" className="text-sm font-medium ">
                    Mot de passe
                </Label>
                <div className="relative mt-1">
                    <Lock className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2" />
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 "
                        aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            <Button type="submit" className="w-full font-medium">
                Se connecter
            </Button>
        </motion.form>
    );
};

type SignUpFormProps = {
    showPassword: boolean;
    togglePasswordVisibility: () => void;
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
    setIsLogin: (value: boolean) => void;
};

const SignUpForm: React.FC<SignUpFormProps> = ({
                                                   showPassword,
                                                   togglePasswordVisibility,
                                                   onError,
                                               }) => {
    const [passwordError, setPasswordError] = React.useState<string | null>(null);

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            setPasswordError(`Le mot de passe doit contenir au moins ${minLength} caractères.`);
        } else if (!hasUpperCase) {
            setPasswordError("Le mot de passe doit contenir au moins une majuscule.");
        } else if (!hasNumber) {
            setPasswordError("Le mot de passe doit contenir au moins un chiffre.");
        } else if (!hasSpecialChar) {
            setPasswordError("Le mot de passe doit contenir au moins un caractère spécial.");
        } else {
            setPasswordError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        try {
            const result = await signup(data);
            if (result?.error) {
                onError(result.error);
            }
        } catch (error) {
            console.error(error);
            onError("Une erreur est survenue lors de l’inscription.");
        }
    };

    return (
        <motion.form
            key="signupForm"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            noValidate
            onSubmit={handleSubmit}
        >
            <div className="mb-4">
                <Label htmlFor="firstName" className="text-sm font-medium ">
                    Prénom
                </Label>
                <div className="relative mt-1">
                    <User className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2" />
                    <Input id="firstName" name="firstName" type="text" placeholder="Jean" className="pl-8" required />
                </div>
            </div>

            <div className="mb-4">
                <Label htmlFor="lastName" className="text-sm font-medium ">
                    Nom
                </Label>
                <div className="relative mt-1">
                    <User className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 " />
                    <Input id="lastName" name="lastName" type="text" placeholder="Dupont" className="pl-8" required />
                </div>
            </div>
            <div className="mb-4">
                <Label htmlFor="emailSignup" className="text-sm font-medium">
                    Adresse e-mail
                </Label>
                <div className="relative mt-1">
                    <Mail className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2" />
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

            <div className="mb-6">
                <Label htmlFor="passwordSignup" className="text-sm font-medium">
                    Mot de passe
                </Label>
                <div className="relative mt-1">
                    <Lock className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2" />
                    <Input
                        id="passwordSignup"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-8 pr-10"
                        required
                        onChange={(e) => validatePassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>

            <Button type="submit" className="w-full font-medium">
                S&apos;inscrire
            </Button>
        </motion.form>
    );
};

function AuthPageContent() {
    const [isLogin, setIsLogin] = React.useState(true);
    const [showPassword, setShowPassword] = React.useState(false);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const success = searchParams.get('success');

    useEffect(() => {
        if (success === 'true') {
            toast({
                title: "Succès",
                description: "Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.",
                variant: "default",
            });
        }
    }, [success, toast]);

    const togglePasswordVisibility = React.useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const handleError = (message: string) => {
        toast({
            title: "Erreur",
            description: message,
            variant: "destructive",
        });
    };

    const handleSuccess = (message: string) => {
        toast({
            title: "Succès",
            description: message,
            variant: "default",
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b bg-muted px-4">
            <Toaster />
            <Logo />
            <Card className="mt-6 pt-6 w-full max-w-md">
                <CardContent>
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
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <LoginForm showPassword={showPassword} togglePasswordVisibility={togglePasswordVisibility} onError={handleError} />
                        ) : (
                            <SignUpForm
                                showPassword={showPassword}
                                togglePasswordVisibility={togglePasswordVisibility}
                                onError={handleError}
                                onSuccess={handleSuccess}
                                setIsLogin={setIsLogin}
                            />
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AuthPage(){
    return(
        <Suspense fallback={<div>chargement</div>}>
            <AuthPageContent />
        </Suspense>
    )
}
