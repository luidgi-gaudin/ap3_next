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

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const {error} = await supabase.auth.signInWithPassword(data)

    if (error) {
        return {error: error.message.includes("Invalid login credentials") ? "Email ou mot de passe incorrect." : error.message};
    }
    redirect('/')

}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;
    const prenom = formData.get('firstName') as string | null;
    const nom = formData.get('lastName') as string | null;

    if (!email || !password || !prenom || !nom ) {
        return { error: "Veuillez remplir tous les champs." };
    }

    const { data: dataUser, error } = await supabase.auth.signUp({ email, password });

    if (error || !dataUser?.user) {
        return { error: error?.message || "Erreur lors de l'inscription." };
    }

    const userId = dataUser.user.id;

    const utilisateurData = {
        email,
        prenom,
        nom,
        supabase_id: userId,
        id_role: 2,
    };

    try {
        await UtilisateurService.CreateUtilisateur(utilisateurData);
    } catch {
        return { error: "Un compte existe déja avec cette adresse mail" };
    }
    revalidatePath('/login', 'layout');
    redirect('/login?success=true');

    return { error: null };
}
