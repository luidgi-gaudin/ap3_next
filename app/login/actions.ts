'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import UtilisateurService from "@/services/utilisateurService";

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/login', 'layout')
    redirect('/login')
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: dataUser, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/error')
    }

    const userid= dataUser.user?.id;
    const utilisateur = await UtilisateurService.getUtilisateurBySupabaseId(userid);

    if (!utilisateur) {
        redirect('/error')
    }
    switch (utilisateur.id_role) {
        case 1:
            redirect('/admin');
            break;
        case 2:
            redirect('/dashboard');
            break;
        default:
            console.error(`Rôle utilisateur inconnu : ${utilisateur.id_role}`);
            redirect('/error');
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
        console.error("Champs manquants ou invalides :", {
            email,
            password,
            prenom,
            nom,
            id_role,
        });
        redirect('/error'); // Redirigez l'utilisateur à une page d'erreur
    }

    console.log("Données soumises pour l'inscription Supabase :", { email, password });

    // Étape 1 : Inscription sur Supabase
    const { data: dataUser, error } = await supabase.auth.signUp({ email, password });

    // Vérifiez si une erreur s'est produite
    if (error || !dataUser?.user) {
        console.error("Erreur lors de l'inscription avec Supabase :", error);
        redirect('/error');
        return;
    }

    const userId = dataUser.user.id; // ID utilisateur créé par Supabase

    console.log("Utilisateur enregistré avec succès dans Supabase :", userId);

    const utilisateurData = {
        email,
        prenom,
        nom,
        supabase_id: userId,
        id_role: parseInt(id_role),
    };

    console.log("Données utilisateur prêtes pour Prisma :", utilisateurData);

    try {
        await UtilisateurService.CreateUtilisateur(utilisateurData);
    } catch (errorUtilisateur) {
        console.error("Erreur lors de la création de l'utilisateur dans Prisma :", errorUtilisateur);
        redirect('/error');
    }

    revalidatePath('/', 'layout');
    redirect('/');
}