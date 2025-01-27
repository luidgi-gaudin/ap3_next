import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import UtilisateurService from "@/services/utilisateurService";

export async function POST(req: Request) {
    const { firstName, lastName, currentPassword, newPassword } = await req.json();
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }
        const supabaseId = data.user.id;

    if (newPassword) {
        // Vérification du mot de passe actuel
        const {error: signInError} = await supabase.auth.signInWithPassword({
            email: data.user.email as string,
            password: currentPassword,
        });

        if (signInError) {
            return NextResponse.json({error: "Mot de passe actuel incorrect."}, {status: 400});
        }
    }

    try {
        // Mise à jour des informations utilisateur dans Prisma
        await UtilisateurService.updateUtilisateurBySupabaseId(supabaseId, {
            prenom: firstName,
            nom: lastName,
        });

        // Mise à jour du mot de passe dans Supabase
        if (newPassword) {
            const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
            if (passwordError) throw passwordError;
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Erreur lors de la mise à jour :", err);
        return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }
}
