import * as React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UtilisateurService from "@/services/utilisateurService";
import { AccountForm } from "@/components/dashboard/account/AccountForm";

export default async function AccountPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        redirect("/login");
    }

    // Récupérer les informations utilisateur depuis Prisma
    const utilisateur = await UtilisateurService.getUtilisateurBySupabaseId(data.user.id);

    if (!utilisateur) {
        console.error("Utilisateur introuvable.");
        redirect("/error");
    }

    return <AccountForm utilisateur={utilisateur} />;
}
