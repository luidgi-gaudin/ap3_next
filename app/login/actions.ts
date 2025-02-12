'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UtilisateurService from "@/services/utilisateurService";
import { toast } from '@/hooks/use-toast';

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/login', 'layout')
    redirect('/login')
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: dataUser, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        if (error.message.includes("Invalid login credentials")) {
            toast({
                title: "Erreur de connexion",
                description: "Email ou mot de passe incorrect.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Erreur de connexion",
                description: error.message,
                variant: "destructive",
            });
        }
        return;
    }

    const userid = dataUser.user?.id;
    const utilisateur = await UtilisateurService.getUtilisateurBySupabaseId(userid);

    if (!utilisateur) {
        toast({
            title: "Erreur",
            description: "Utilisateur non trouvé.",
            variant: "destructive",
        });
        return;
    }

    switch (utilisateur.id_role) {
        case 1:
            redirect('/admin');
            break;
        case 2:
            redirect('/dashboard');
            break;
        default:
            toast({
                title: "Erreur",
                description: `Rôle utilisateur inconnu : ${utilisateur.id_role}`,
                variant: "destructive",
            });
            break;
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;
    const prenom = formData.get('firstName') as string | null;
    const nom = formData.get('lastName') as string | null;
    const id_role = formData.get('role') as string | null;

    if (!email || !password || !prenom || !nom || !id_role) {
        toast({
            title: "Erreur d'inscription",
            description: "Veuillez remplir tous les champs.",
            variant: "destructive",
        });
        return;
    }

    const { data: dataUser, error } = await supabase.auth.signUp({ email, password });

    if (error || !dataUser?.user) {
        toast({
            title: "Erreur d'inscription",
            description: error?.message || "Erreur lors de l'inscription.",
            variant: "destructive",
        });
        return;
    }

    const userId = dataUser.user.id;

    const utilisateurData = {
        email,
        prenom,
        nom,
        supabase_id: userId,
        id_role: parseInt(id_role),
    };

    try {
        await UtilisateurService.CreateUtilisateur(utilisateurData);
    } catch {
        toast({
            title: "Erreur",
            description: "Erreur lors de la création de l'utilisateur dans Prisma.",
            variant: "destructive",
        });
        return;
    }

    revalidatePath('/', 'layout');
    redirect('/');
}
